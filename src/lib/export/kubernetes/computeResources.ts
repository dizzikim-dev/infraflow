/**
 * Kubernetes Compute Resource Generators
 *
 * Generates Kubernetes YAML for compute-related infrastructure components
 * including web/app servers, database StatefulSets, message queues,
 * and monitoring services.
 *
 * @module lib/export/kubernetes/computeResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import type { KubernetesExportOptions } from './types';
import { sanitizeK8sName, generateDeployment } from './helpers';

/**
 * Compute node type resource generators for Kubernetes.
 */
export const computeResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, options: KubernetesExportOptions) => string>> = {
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

  'kafka': (node, options) => `
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: messaging
spec:
  serviceName: ${sanitizeK8sName(node.id)}
  replicas: 3
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: messaging
    spec:
      containers:
        - name: kafka
          image: confluentinc/cp-kafka:7.5.0
          ports:
            - containerPort: 9092
            - containerPort: 9093
          resources:
            requests:
              memory: "1Gi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          volumeMounts:
            - name: data
              mountPath: /var/lib/kafka/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - name: plaintext
      port: 9092
      targetPort: 9092
    - name: tls
      port: 9093
      targetPort: 9093
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'rabbitmq': (node, options) => `
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: messaging
spec:
  serviceName: ${sanitizeK8sName(node.id)}
  replicas: 3
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: messaging
    spec:
      containers:
        - name: rabbitmq
          image: rabbitmq:3.12-management
          ports:
            - containerPort: 5672
            - containerPort: 15672
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          volumeMounts:
            - name: data
              mountPath: /var/lib/rabbitmq
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - name: amqp
      port: 5672
      targetPort: 5672
    - name: management
      port: 15672
      targetPort: 15672
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'prometheus': (node, options) => `
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: monitoring
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
        tier: monitoring
    spec:
      containers:
        - name: prometheus
          image: prom/prometheus:v2.48.0
          ports:
            - containerPort: 9090
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "500m"
          volumeMounts:
            - name: data
              mountPath: /prometheus
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - port: 9090
      targetPort: 9090
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'grafana': (node, options) => {
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
    tier: monitoring
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
        tier: monitoring
    spec:
      containers:
        - name: grafana
          image: grafana/grafana:10.2.0
          ports:
            - containerPort: 3000
          env:
            - name: GF_SECURITY_ADMIN_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: grafana-secrets
                  key: admin-password
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - port: 3000
      targetPort: 3000
  selector:
    app: ${sanitizeK8sName(node.id)}`;
  },
};
