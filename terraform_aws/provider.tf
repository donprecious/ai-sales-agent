# Configure the AWS provider
provider "aws" {
  region = var.aws_region
  # Credentials are expected to be configured in the environment
  # (e.g., through environment variables, shared credentials file, or IAM roles).
}