variable "project" {
  type    = string
  default = "ai-resume-analyzer"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "container_image" {
  type        = string
  description = "Backend container image URI"
}
