# --- ECR Outputs ---

output "ecr_frontend_repository_url" {
  description = "The URL of the ECR repository for the frontend application."
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_repository_url" {
  description = "The URL of the ECR repository for the backend application."
  value       = aws_ecr_repository.backend.repository_url
}

# --- EKS Cluster Outputs ---

output "eks_cluster_name" {
  description = "The name of the EKS cluster."
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS cluster's Kubernetes API server."
  value       = aws_eks_cluster.main.endpoint
}

output "eks_cluster_oidc_issuer_url" {
  description = "The OIDC issuer URL for the EKS cluster."
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

output "eks_cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the EKS cluster."
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true # Mark as sensitive as it contains certificate data
}

# --- EKS Worker Node Outputs ---

output "eks_worker_node_iam_role_arn" {
  description = "The ARN of the IAM role used by the EKS worker nodes."
  value       = aws_iam_role.eks_node_role.arn
}

# --- VPC Outputs (Optional, but can be useful) ---

output "vpc_id" {
  description = "The ID of the created VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of IDs of the public subnets."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of IDs of the private subnets."
  value       = aws_subnet.private[*].id
}