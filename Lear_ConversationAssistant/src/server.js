const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const jsHandler = require('./jsResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    // html
    '/': htmlHandler.getIndex,
    '/styles.css': htmlHandler.getCSS,
    '/app': htmlHandler.getIndex,
    notFound: htmlHandler.get404Response,
    // json
    '/questions': jsonHandler.getQuestions,
    // js
    '/scripts.js': jsHandler.getClientScript,
  },
  HEAD: {
    '/questions': jsonHandler.getQuestions,
    notFound: htmlHandler.get404Response,
  },
  POST: {
    '/ask-question': jsonHandler.addQuestionBeta,
    '/delete-question': jsonHandler.deleteQuestion,
    '/respond': jsonHandler.replyToQuestion,
    '/respond-multiple-choice': jsonHandler.replyToMultipleChoice,
    notFound: htmlHandler.get404Response,
  },
};

const onRequest = (request, response) => {
  let acceptedTypes = request.headers.accept && request.headers.accept.split(',');
  acceptedTypes = acceptedTypes || [];

  const parsedUrl = url.parse(request.url);
  const { pathname } = parsedUrl;

  if (urlStruct[request.method][pathname]) {
    // console.log(`Directing to ${pathname}`);

    urlStruct[request.method][pathname](request, response, parsedUrl, acceptedTypes);
  } else {
    urlStruct[request.method].notFound(request, response, parsedUrl, acceptedTypes);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
