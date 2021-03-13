const query = require('querystring');

let questions = [];

class Question {
  constructor(type, content, id, dateCreated, upvotes = 0, responses = [], author = 'Anonymous', choices = [], answers = []) {
    this.type = type; // string
    this.content = content; // string
    this.id = id; // uuid string
    this.dateCreated = dateCreated; // date created
    this.upvotes = upvotes; // number
    this.responses = responses; // array
    this.author = author;
    this.choices = choices;
    this.answers = answers;
  }
}

// sample question data
const sampleQuestion0 = new Question('openEnded', 'Why do you enjoy web-app development?');
sampleQuestion0.id = 'xxx';
sampleQuestion0.dateCreated = Date.now() + 1000;
sampleQuestion0.upvotes = 7;
sampleQuestion0.responses = [];
sampleQuestion0.author = 'The Developer';
questions.push(sampleQuestion0);

const sampleQuestion1 = new Question('multipleChoice', 'Which movie is best?');
sampleQuestion1.id = 'yyy';
sampleQuestion1.dateCreated = Date.now() + 2000;
sampleQuestion1.upvotes = 28; // not currently editable, but still part of sortinf paramters
sampleQuestion1.responses = [];
sampleQuestion1.author = 'The Developer';
sampleQuestion1.choices = ['Naked Lunch', 'Frozen 2', 'Good Will Hunting'];
sampleQuestion1.answers = ['Naked Lunch', 'Naked Lunch', 'Naked Lunch', 'Frozen 2', 'Good Will Hunting'];
questions.push(sampleQuestion1);

const sampleQuestion2 = new Question('multipleChoice', 'Coke or Pepsi?');
sampleQuestion2.id = 'zzz';
sampleQuestion2.dateCreated = Date.now() + 3000;
sampleQuestion2.upvotes = 12;
sampleQuestion2.responses = [];
sampleQuestion2.author = 'The Developer';
sampleQuestion2.choices = ['Coke', 'Pepsi'];
sampleQuestion2.answers = ['Coke', 'Coke', 'Coke', 'Pepsi'];
questions.push(sampleQuestion2);

const respondJSON = (request, response, status, object) => {
  console.log(`Responding to ${request.method} request for ${request.url}  with code: ${status}`);
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));

  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const respondXML = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'text/xml' });
  response.write(object);

  response.end();
};

const sortByDateCreated = (a, b) => {
  if (a.dateCreated > b.dateCreated) {
    return -1;
  } if (a.dateCreated < b.dateCreated) {
    return 1;
  }
  return 0;
};

const sortByUpvotes = (a, b) => {
  if (a.upvotes > b.upvotes) {
    return 1;
  }
  if (a.upvotes < b.upvotes) {
    return -1;
  }
  return 0;
};

const getQuestions = (request, response, body, acceptedTypes) => {
  const { filter } = query.parse(body.query);

  switch (filter) {
    case 'latest':
      console.log('resorting by latest');
      questions = questions.sort(sortByDateCreated);
      break;
    case 'highest':
      console.log('resorting by highest');
      questions = questions.sort(sortByUpvotes).reverse();
      break;
    case 'oldest':
      console.log('resorting by oldest');
      questions = questions.sort(sortByDateCreated).reverse();
      break;

    default:
      questions = questions.sort(sortByDateCreated);
  }

  const responseJSON = {
    questions,
  };

  let questionString;

  for (const question of questions) {
    let propString;
    propString += `<type>${question.type}</type>`;
    propString += `<content>${question.content}</content>`;
    propString += `<id>${question.id}</id>`;
    propString += `<date-created>${question.dateCreated}</date-created>`;
    propString += `<upvotes>${question.upvotes}</upvotes>`;
    propString += `<responses>${JSON.stringify(question.responses)}</responses>`;
    propString += `<author>${question.author}</author>`;
    propString += `<choices>${JSON.stringify(question.choices)}</choices>`;
    propString += `<answers>${JSON.stringify(question.answers)}</answers>`;

    questionString += `<question>${propString}</question>`;
  }

  const questionsString = `<questions>${questionString}</questions`;
  const xmlResponse = `<response>${questionsString}</response>`;
  console.log(acceptedTypes);

  return respondJSON(request, response, 200, responseJSON);
  // return respondXML(request, response, 200, xmlResponse)
};

// helper to create unique identifier, taken from https://www.w3resource.com
function createUUID() {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

const addQuestion = (request, response, body) => {
  const responseJSON = {
    message: 'question type and content are both required',
  };

  if (!body.content || !body.type) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON); // 400=bad request
  }

  const responseCode = 201; // "created"

  // constructor(type, content,id, dateCreated,upvotes = 0, responses = [], author = 'Anonymous')
  const aQuestion = new Question(body.type, body.content, createUUID(), Date.now());
  aQuestion.author = body.author;
  if (body.choices) aQuestion.choices = JSON.parse(body.choices);

  if (responseCode === 201) {
    questions.push(aQuestion);
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const addQuestionBeta = (request, response) => {
  const body = [];

  // https://nodejs.org/api/http.html
  request.on('error', (error) => {
    console.dir(error);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    addQuestion(request, response, bodyParams);
  });
};

const deleteQuestion = (request, response) => {
  const body = [];

  // https://nodejs.org/api/http.html
  request.on('error', (error) => {
    console.dir(error);
    response.statusCode = 204;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].id === bodyParams.remove) {
        console.log(`Destroyed question with id ${bodyParams.remove} at index ${i}`);
        questions.splice(i, 1);
      }
    }
  });
};

const replyToQuestion = (request, response) => {
  const body = [];

  // https://nodejs.org/api/http.html
  request.on('error', (error) => {
    console.dir(error);
    response.statusCode = 201;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].id === bodyParams.questionId) {
        console.log(`Reply made to question ${bodyParams.questionId} at index ${i}`);
        questions[i].responses.push(bodyParams.response);
      }
    }
  });
};

const replyToMultipleChoice = (request, response) => {
  const body = [];

  // https://nodejs.org/api/http.html
  request.on('error', (error) => {
    console.dir(error);
    response.statusCode = 201;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].id === bodyParams.questionId) {
        questions[i].answers.push(bodyParams.response);

        console.log(`Reply made to multiple choice question ${bodyParams.questionId} at index ${i}`);
      }
    }
  });
};

module.exports = {
  getQuestions,
  addQuestion,
  addQuestionBeta,
  deleteQuestion,
  replyToQuestion,
  replyToMultipleChoice,
};
