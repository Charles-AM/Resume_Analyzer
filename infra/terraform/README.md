# Terraform AWS Option

This module sketches the production AWS path:

- ECS Fargate for the FastAPI backend and Celery workers
- RDS PostgreSQL with pgvector enabled
- ElastiCache Redis for caching and Celery broker
- S3 for resume storage
- CloudWatch logs and metrics

Subnet, VPC, task definition, IAM, and load balancer resources should be filled with environment-specific values before applying.
