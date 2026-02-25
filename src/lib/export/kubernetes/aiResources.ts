/**
 * Kubernetes AI Resource Generators
 *
 * Generates Kubernetes YAML for AI-related infrastructure components
 * including GPU server Deployments, model registry, inference engines,
 * vector databases, and other AI compute and service nodes.
 *
 * @module lib/export/kubernetes/aiResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import type { KubernetesExportOptions } from './types';
import { sanitizeK8sName } from './helpers';

/**
 * AI node type resource generators for Kubernetes.
 */
export const aiResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, options: KubernetesExportOptions) => string>> = {
  // AI Compute
  'gpu-server': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: gpu-server
          image: nvidia/cuda:12.0-runtime
          resources:
            limits:
              nvidia.com/gpu: "1"
          ports:
            - containerPort: 8080
`,
  'ai-accelerator': () => `# AI Accelerator: Hardware device - managed outside Kubernetes`,
  'edge-device': () => `# Edge Device: On-premise device - managed outside Kubernetes`,
  'mobile-device': () => `# Mobile Device: End-user device - managed outside Kubernetes`,
  'ai-cluster': (node, options) => `
---
# AI Cluster: Use NVIDIA GPU Operator or Kueue for multi-node GPU scheduling
apiVersion: v1
kind: Namespace
metadata:
  name: ${sanitizeK8sName(node.id)}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
`,
  'model-registry': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: mlflow
          image: ghcr.io/mlflow/mlflow:latest
          ports:
            - containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 5000
      targetPort: 5000
`,

  // AI Service
  'inference-engine': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: ${options.replicaCount || 2}
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: inference
          image: vllm/vllm-openai:latest
          resources:
            limits:
              nvidia.com/gpu: "1"
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 8080
      targetPort: 8080
`,
  'vector-db': (node, options) => `
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  serviceName: ${sanitizeK8sName(node.id)}
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: vector-db
          image: chromadb/chroma:latest
          ports:
            - containerPort: 8000
          volumeMounts:
            - name: data
              mountPath: /chroma/chroma
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
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 8000
      targetPort: 8000
`,
  'ai-gateway': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: ${options.replicaCount || 2}
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: ai-gateway
          image: ghcr.io/berriai/litellm:main-latest
          ports:
            - containerPort: 4000
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 4000
      targetPort: 4000
`,
  'ai-orchestrator': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: ${options.replicaCount || 2}
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: orchestrator
          image: langchain/langserve:latest
          ports:
            - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 8000
      targetPort: 8000
`,
  'embedding-service': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: ${options.replicaCount || 2}
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: embedding
          image: ghcr.io/huggingface/text-embeddings-inference:latest
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 8080
      targetPort: 8080
`,
  'training-platform': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: mlflow
          image: ghcr.io/mlflow/mlflow:latest
          ports:
            - containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 5000
      targetPort: 5000
`,
  'prompt-manager': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: prompt-manager
          image: prompt-manager:latest
          ports:
            - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 3000
      targetPort: 3000
`,
  'ai-monitor': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.label)}
    spec:
      containers:
        - name: ai-monitor
          image: evidently-ai:latest
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    app: ${sanitizeK8sName(node.label)}
  ports:
    - port: 8080
      targetPort: 8080
`,
};
