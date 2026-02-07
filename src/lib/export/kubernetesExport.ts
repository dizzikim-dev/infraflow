import { InfraSpec, InfraNodeSpec, InfraNodeType } from '@/types';

/**
 * Kubernetes export options
 */
export interface KubernetesExportOptions {
  namespace?: string;
  includeNamespace?: boolean;
  includeIngress?: boolean;
  includeNetworkPolicy?: boolean;
  replicaCount?: number;
}

/**
 * Map node types to Kubernetes resources
 */
const kubernetesResourceMap: Record<InfraNodeType, (node: InfraNodeSpec, options: KubernetesExportOptions) => string> = {
  // Security nodes
  'firewall': (node, options) => `
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${sanitizeK8sName(node.id)}-firewall
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  podSelector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443
        - protocol: TCP
          port: 80
  egress:
    - to:
        - namespaceSelector: {}`,

  'waf': (node, options) => `
---
# WAF configuration typically handled by ingress controller or external WAF
# For example, using ModSecurity with NGINX Ingress
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${sanitizeK8sName(node.id)}-waf-rules
  namespace: ${options.namespace || 'default'}
data:
  modsecurity.conf: |
    SecRuleEngine On
    SecRequestBodyAccess On
    SecRule REQUEST_HEADERS:Content-Type "text/xml" "id:200000,phase:1,t:none,t:lowercase,pass,nolog,ctl:requestBodyProcessor=XML"`,

  'ids-ips': (node, options) => `
---
# IDS/IPS typically deployed as a DaemonSet
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ${sanitizeK8sName(node.id)}-ids
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}-ids
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}-ids
    spec:
      containers:
        - name: falco
          image: falcosecurity/falco:latest
          securityContext:
            privileged: true`,

  'vpn-gateway': () => `# VPN Gateway: Managed externally or via service mesh`,
  'nac': () => `# NAC: Implemented via NetworkPolicy and service mesh`,
  'dlp': () => `# DLP: Implemented via custom admission controller`,

  // Network nodes
  'router': () => `# Router: Kubernetes networking handled by CNI plugin`,
  'switch-l2': () => `# L2 Switch: Kubernetes networking handled by CNI plugin`,
  'switch-l3': () => `# L3 Switch: Kubernetes networking handled by CNI plugin`,

  'load-balancer': (node, options) => `
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}-lb
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
  selector:
    tier: web`,

  'sd-wan': () => `# SD-WAN: Managed externally`,

  'dns': (node, options) => `
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}-dns
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - name: dns
      port: 53
      targetPort: 53
      protocol: UDP
  selector:
    app: coredns`,

  'cdn': () => `# CDN: Managed externally (CloudFront, Cloudflare, etc.)`,

  // Compute nodes
  'web-server': (node, options) => generateDeployment(node, options, 'web', 80),
  'app-server': (node, options) => generateDeployment(node, options, 'app', 8080),

  'db-server': (node, options) => `
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: database
    managed-by: infraflow
spec:
  serviceName: ${sanitizeK8sName(node.id)}
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: database
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
              name: mysql
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: ${sanitizeK8sName(node.id)}-secret
                  key: root-password
            - name: MYSQL_DATABASE
              value: appdb
          volumeMounts:
            - name: data
              mountPath: /var/lib/mysql
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - port: 3306
      targetPort: 3306
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'container': (node, options) => generateDeployment(node, options, 'container', 8080),
  'vm': () => `# VM: Use KubeVirt for VM workloads in Kubernetes`,

  'kubernetes': () => `# Kubernetes cluster: This is the target platform`,

  // Cloud nodes
  'aws-vpc': () => `# AWS VPC: Kubernetes runs within the VPC`,
  'azure-vnet': () => `# Azure VNet: Kubernetes runs within the VNet`,
  'gcp-network': () => `# GCP Network: Kubernetes runs within the network`,
  'private-cloud': () => `# Private Cloud: Kubernetes deployment target`,

  // Storage nodes
  'san-nas': (node, options) => `
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${sanitizeK8sName(node.id)}-pvc
  namespace: ${options.namespace || 'default'}
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: efs-sc
  resources:
    requests:
      storage: 100Gi`,

  'object-storage': () => `# Object Storage: Use S3-compatible storage via CSI driver`,
  'backup': () => `# Backup: Use Velero for cluster backup`,

  'cache': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: cache
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: cache
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - port: 6379
      targetPort: 6379
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'storage': (node, options) => `
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${sanitizeK8sName(node.id)}-pvc
  namespace: ${options.namespace || 'default'}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi`,

  // Auth nodes
  'ldap-ad': () => `# LDAP/AD: Integrate via external identity provider`,
  'sso': () => `# SSO: Implement via OAuth2 Proxy or Dex`,
  'mfa': () => `# MFA: Implement at identity provider level`,
  'iam': () => `# IAM: Use RBAC and ServiceAccounts`,

  // External nodes
  'user': () => `# User: External client`,
  'internet': () => `# Internet: External network`,

  // Zone
  'zone': () => `# Zone: Network zone boundary`,
};

/**
 * Generate a standard Deployment
 */
function generateDeployment(
  node: InfraNodeSpec,
  options: KubernetesExportOptions,
  tier: string,
  port: number
): string {
  const replicaCount = options.replicaCount || 2;

  return `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: ${tier}
    managed-by: infraflow
spec:
  replicas: ${replicaCount}
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: ${tier}
    spec:
      containers:
        - name: ${tier}
          image: nginx:latest  # Replace with your image
          ports:
            - containerPort: ${port}
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
          readinessProbe:
            httpGet:
              path: /health
              port: ${port}
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: ${port}
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
spec:
  type: ClusterIP
  ports:
    - port: ${port}
      targetPort: ${port}
  selector:
    app: ${sanitizeK8sName(node.id)}`;
}

/**
 * Sanitize name for Kubernetes resources (lowercase, alphanumeric, hyphens)
 */
function sanitizeK8sName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63);
}

/**
 * Generate namespace resource
 */
function generateNamespace(namespace: string): string {
  return `
---
apiVersion: v1
kind: Namespace
metadata:
  name: ${namespace}
  labels:
    managed-by: infraflow`;
}

/**
 * Generate Ingress resource
 */
function generateIngress(spec: InfraSpec, options: KubernetesExportOptions): string {
  const webNodes = spec.nodes.filter((n) =>
    ['web-server', 'load-balancer'].includes(n.type)
  );

  if (webNodes.length === 0) return '';

  const rules = webNodes.map((node) => `
        - path: /
          pathType: Prefix
          backend:
            service:
              name: ${sanitizeK8sName(node.id)}
              port:
                number: 80`).join('');

  return `
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: ${options.namespace || 'default'}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - example.com
      secretName: tls-secret
  rules:
    - host: example.com
      http:
        paths:${rules}`;
}

/**
 * Generate default NetworkPolicy
 */
function generateDefaultNetworkPolicy(options: KubernetesExportOptions): string {
  return `
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: ${options.namespace || 'default'}
spec:
  podSelector: {}
  policyTypes:
    - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-internal
  namespace: ${options.namespace || 'default'}
spec:
  podSelector: {}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector: {}`;
}

/**
 * Export InfraSpec to Kubernetes YAML format
 */
export function exportToKubernetes(
  spec: InfraSpec,
  options: KubernetesExportOptions = {}
): string {
  const {
    namespace = 'default',
    includeNamespace = true,
    includeIngress = true,
    includeNetworkPolicy = true,
  } = options;

  const sections: string[] = [];

  // Header comment
  sections.push(`# Kubernetes manifests generated by InfraFlow
# Namespace: ${namespace}
# Generated: ${new Date().toISOString()}
`);

  // Namespace
  if (includeNamespace && namespace !== 'default') {
    sections.push(generateNamespace(namespace));
  }

  // Network policies
  if (includeNetworkPolicy) {
    sections.push(generateDefaultNetworkPolicy(options));
  }

  // Resources
  sections.push('\n# ============= Application Resources =============\n');

  for (const node of spec.nodes) {
    const resourceGenerator = kubernetesResourceMap[node.type];
    if (resourceGenerator) {
      const resource = resourceGenerator(node, options);
      if (resource && !resource.startsWith('#')) {
        sections.push(resource);
      } else if (resource) {
        sections.push(`\n${resource}`);
      }
    } else {
      sections.push(`\n# Unknown node type: ${node.type} - ${node.label}`);
    }
  }

  // Ingress
  if (includeIngress) {
    const ingress = generateIngress(spec, options);
    if (ingress) {
      sections.push('\n# ============= Ingress =============');
      sections.push(ingress);
    }
  }

  return sections.join('\n');
}
