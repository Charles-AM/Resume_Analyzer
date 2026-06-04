terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "resumes" {
  bucket_prefix = "${var.project}-resumes-"
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project}/backend"
  retention_in_days = 30
}

resource "aws_ecs_cluster" "main" {
  name = var.project
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db"
  subnet_ids = []
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project}-cache"
  subnet_ids = []
}

output "resume_bucket" {
  value = aws_s3_bucket.resumes.bucket
}

output "ecs_cluster" {
  value = aws_ecs_cluster.main.name
}
