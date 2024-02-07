## Cloudwatch log group used by this task
resource "aws_cloudwatch_log_group" "task_log_group" {
  count             = var.create_log_group ? 1 : 0
  name              = "/ecs/${var.family}"
  retention_in_days = var.log_retention
}


## Role used by task
resource "aws_iam_role" "task_role" {
  name = "tf-cube-ECSC_${var.family}-TR"
  assume_role_policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Effect" : "Allow",
          "Principal" : {
            "Service" : "ecs-tasks.amazonaws.com"
          },
          "Action" : "sts:AssumeRole"
        }
      ]
    }
  )
}

resource "aws_iam_role_policy_attachment" "task-managed-policy-attach" {
  role       = aws_iam_role.task_role.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_custom_s3_policy" {
  name = "${var.family}-task-s3-policy"
  role = aws_iam_role.task_role.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:GetBucketLocation",
          "s3:ListAllMyBuckets"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:*"
        ],
        "Resource" : [
          "${var.bucket_arn}",
          "${var.bucket_arn}/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogGroup"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "task_custom_s3_cross_account_policy" {
  count = var.bucket_cross_account_name == null ? 0 : 1

  name = "${var.family}-task-cross-s3-policy"
  role = aws_iam_role.task_role.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:GetBucketLocation",
          "s3:ListAllMyBuckets"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:List*",
          "s3:Get*"
        ],
        "Resource" : [
          "arn:aws:s3:::${var.bucket_cross_account_name}",
          "arn:aws:s3:::${var.bucket_cross_account_name}/*"
        ]
      }
    ]
  })
}


locals {
  cpu_architecture = var.cpu_architecture != null ? [var.cpu_architecture] : []
  volumes          = var.shared_volumes != null ? var.shared_volumes : []
}

resource "aws_ecs_task_definition" "task" {
  family                   = var.family
  container_definitions    = var.container_definitions
  task_role_arn            = aws_iam_role.task_role.arn
  execution_role_arn       = aws_iam_role.task_role.arn
  network_mode             = var.network_mode
  requires_compatibilities = var.requires_compatibilities == null ? [] : [var.requires_compatibilities]
  cpu                      = var.cpu
  memory                   = var.memory

  dynamic "runtime_platform" {
    for_each = local.cpu_architecture

    content {
      cpu_architecture        = runtime_platform.value
      operating_system_family = var.operating_system_family
    }
  }

  dynamic "volume" {
    for_each = local.volumes

    content {
      name = volume.value

      docker_volume_configuration {
        scope  = "task"
        driver = "local"
      }
    }
  }

}