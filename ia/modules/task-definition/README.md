## Description

This module create a Task Service with all the Best Practice yet applicated.

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~> 1.5 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 5.4 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | ~> 5.4 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_cloudwatch_log_group.task_log_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_ecs_task_definition.task](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition) | resource |
| [aws_iam_role.task_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy.task_custom_s3_cross_account_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_iam_role_policy.task_custom_s3_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_iam_role_policy_attachment.task-managed-policy-attach](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_bucket_arn"></a> [bucket\_arn](#input\_bucket\_arn) | (Required) Bucket ARN to assign write permission to the task | `string` | n/a | yes |
| <a name="input_bucket_cross_account_name"></a> [bucket\_cross\_account\_name](#input\_bucket\_cross\_account\_name) | (Optional) Bucket ARN cross account to assign readonly permission to the task | `string` | `null` | no |
| <a name="input_container_definitions"></a> [container\_definitions](#input\_container\_definitions) | (Required) A list of valid container definitions provided as a single valid JSON document. | `string` | n/a | yes |
| <a name="input_cpu"></a> [cpu](#input\_cpu) | (Optional) Number of cpu units used by the task. If the requires\_compatibilities is FARGATE this field is required. | `number` | `null` | no |
| <a name="input_cpu_architecture"></a> [cpu\_architecture](#input\_cpu\_architecture) | (Optional) Must be set to either X86\_64 or ARM64 | `string` | `null` | no |
| <a name="input_create_log_group"></a> [create\_log\_group](#input\_create\_log\_group) | (Optional) If create the log group inside the task definition module. If you create more task definition into service you need to manage it outside. Default true. | `bool` | `true` | no |
| <a name="input_family"></a> [family](#input\_family) | (Required) A unique name for your task definition. | `string` | n/a | yes |
| <a name="input_log_retention"></a> [log\_retention](#input\_log\_retention) | (Optional) Number of days to retain the task logs | `number` | `30` | no |
| <a name="input_memory"></a> [memory](#input\_memory) | (Optional) Amount (in MiB) of memory used by the task. If the requires\_compatibilities is FARGATE this field is required. | `number` | `null` | no |
| <a name="input_network_mode"></a> [network\_mode](#input\_network\_mode) | (Optional) Docker networking mode to use for the containers in the task. Valid values are none, bridge, awsvpc, and host. | `string` | `null` | no |
| <a name="input_operating_system_family"></a> [operating\_system\_family](#input\_operating\_system\_family) | (Optional) If the requires\_compatibilities is FARGATE this field is required; must be set to a valid option from the operating system family in the runtime platform setting | `string` | `null` | no |
| <a name="input_requires_compatibilities"></a> [requires\_compatibilities](#input\_requires\_compatibilities) | (Optional) Set of launch types required by the task. The valid values are EC2 and FARGATE. | `string` | `null` | no |
| <a name="input_shared_volumes"></a> [shared\_volumes](#input\_shared\_volumes) | (Optional) List of local volume shared between containers inside the task. Default disabled | `set(string)` | `null` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_arn"></a> [arn](#output\_arn) | n/a |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
