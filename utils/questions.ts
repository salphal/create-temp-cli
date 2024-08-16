
export function updateQuestionListByQuestion(question: any, questionList: Array<any>): Array<any> {
  if (!question.name || !Array.isArray(questionList) || !questionList.length) return questionList;
  return questionList.map((v: any) => v.name === question.name ? {...v, ...question} : v);
}

