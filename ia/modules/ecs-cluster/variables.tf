variable "name" {
  type        = string
  description = "(Required) Name of the cluster (up to 255 letters, numbers, hyphens, and underscores)"
}

variable "namespace" {
  type        = string
  default     = null
  description = "(Optional) The ARN of the aws_service_discovery_http_namespace that's used when you create a service and don't specify a Service Connect configuration."
}