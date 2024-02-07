variable "family" {
  type        = string
  description = "(Required) A unique name for your task definition."
}

variable "container_definitions" {
  type        = string
  description = "(Required) A list of valid container definitions provided as a single valid JSON document."
}

variable "network_mode" {
  type        = string
  default     = null
  description = "(Optional) Docker networking mode to use for the containers in the task. Valid values are none, bridge, awsvpc, and host."
}

variable "requires_compatibilities" {
  type        = string
  default     = null
  description = "(Optional) Set of launch types required by the task. The valid values are EC2 and FARGATE."
}

variable "cpu" {
  type        = number
  default     = null
  description = "(Optional) Number of cpu units used by the task. If the requires_compatibilities is FARGATE this field is required."
}

variable "memory" {
  type        = number
  default     = null
  description = "(Optional) Amount (in MiB) of memory used by the task. If the requires_compatibilities is FARGATE this field is required."
}

variable "cpu_architecture" {
  type        = string
  default     = null
  description = "(Optional) Must be set to either X86_64 or ARM64"
}

variable "operating_system_family" {
  type        = string
  default     = null
  description = "(Optional) If the requires_compatibilities is FARGATE this field is required; must be set to a valid option from the operating system family in the runtime platform setting"
}

variable "log_retention" {
  type        = number
  default     = 30
  description = "(Optional) Number of days to retain the task logs"
}

variable "bucket_arn" {
  type        = string
  description = "(Required) Bucket ARN to assign write permission to the task"
}

variable "bucket_cross_account_name" {
  type        = string
  default     = null
  description = "(Optional) Bucket ARN cross account to assign readonly permission to the task"
}

variable "create_log_group" {
  type        = bool
  default     = true
  description = "(Optional) If create the log group inside the task definition module. If you create more task definition into service you need to manage it outside. Default true."
}

variable "shared_volumes" {
  type        = set(string)
  default     = null
  description = "(Optional) List of local volume shared between containers inside the task. Default disabled"
}