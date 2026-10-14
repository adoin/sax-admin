export const agentZh = {
  "agent.chatModel": "模拟对话",
  "agent.planModel": "计划助手",
  "agent.standard": "标准",
  "agent.detailed": "详细",
  "agent.reasoningTitle": "模拟推理过程",
  "agent.reasoningMock": "这里演示的是本地任务流程，不是模型的真实思考记录。",
  "agent.reasoningStandard": "按理解请求、生成草稿、复核结果三个阶段推进。",
  "agent.reasoningDetailed": "详细模式放慢输出，便于观察各阶段的状态与进度。",
  "agent.planTitle": "执行计划",
  "agent.planDescription": "批准后开始模拟执行；拒绝后可以修改请求。",
  "agent.tasksTitle": "执行进度",
  "agent.planRejected": "计划已拒绝，没有执行任务。可以重新输入请求。",
  "agent.planWaiting": "计划已准备好，请在执行计划中批准或拒绝。",
  "agent.planHint":
    "发送请求后，这里会显示推理步骤和任务进度。选择“计划助手”可先审阅执行计划。",
  "agent.taskUnderstand": "理解目标与整理资料",
  "agent.taskDraft": "生成任务草稿",
  "agent.taskReview": "复核并输出结果",
  "agent.sourcesTitle": "组件参考",
  "agent.sourcesNote":
    "下列是本演示用到的组件文档，不是 Mock 回复检索出的资料。",
  "agent.inputSource": "模型选择、快速模式、推理级别与附件输入。",
  "agent.planSource": "可展开的任务计划与批准、拒绝交互。",
  "agent.tryPlan": "试试执行计划",
  "agent.tryChat": "试试快速对话",
  "agent.planPrompt": "为本周的后台管理工作制定执行计划",
  "agent.chatPrompt": "介绍一下这个后台模板的主要功能",
} as const;
export const agentEn: Record<keyof typeof agentZh, string> = {
  "agent.chatModel": "Mock chat",
  "agent.planModel": "Plan assistant",
  "agent.standard": "Standard",
  "agent.detailed": "Detailed",
  "agent.reasoningTitle": "Simulated reasoning",
  "agent.reasoningMock":
    "This is a local task workflow, not a model’s private reasoning.",
  "agent.reasoningStandard":
    "Progress through understanding the request, drafting, and reviewing the result.",
  "agent.reasoningDetailed":
    "Detailed mode slows the output so you can inspect each stage and its progress.",
  "agent.planTitle": "Execution plan",
  "agent.planDescription":
    "Approve to start the simulation, or reject and revise your request.",
  "agent.tasksTitle": "Task progress",
  "agent.planRejected":
    "Plan rejected. No tasks were executed. You can enter a revised request.",
  "agent.planWaiting":
    "The plan is ready. Approve or reject it in the execution plan.",
  "agent.planHint":
    "Send a request to see reasoning steps and task progress. Select Plan assistant to review the plan first.",
  "agent.taskUnderstand": "Understand the goal and organize inputs",
  "agent.taskDraft": "Draft the task response",
  "agent.taskReview": "Review and deliver the result",
  "agent.sourcesTitle": "Component references",
  "agent.sourcesNote":
    "These are documentation links for this demo, not sources retrieved for the mock response.",
  "agent.inputSource":
    "Model selection, fast mode, reasoning effort, and attachments.",
  "agent.planSource": "Expandable task plans with approve and reject actions.",
  "agent.tryPlan": "Try a task plan",
  "agent.tryChat": "Try quick chat",
  "agent.planPrompt": "Create an execution plan for this week’s admin work",
  "agent.chatPrompt": "Introduce the main features of this admin template",
};
