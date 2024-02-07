output "arn" {
  value = aws_ecs_task_definition.task.arn
}

output "role_arn" {
  value = aws_iam_role.task_role.arn
}