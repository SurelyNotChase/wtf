"use strict"; 

var app;

    //helpers for various requests
    const parseJSON = (xhr) => {
    	if(xhr.response && xhr.getResponseHeader('Content-Type') === 'application/json'){
      	const obj = JSON.parse(xhr.response);
      	console.dir(obj);

      }
    };

    const handleGetResponse = (e) => {
        console.log(e.target.status)
        //add question list array to vue instance
      app.questions = JSON.parse(e.target.response).questions;
      for(let question of app.questions){

        question.newResponse = '';
    }
           
      parseJSON(e.target);
    };

    const handlePostResponse = (xhr) => {
        console.log(xhr.status)

      parseJSON(xhr);
    };
    const handleAdminPostResponse =(xhr) =>{
        console.log(xhr.status)

        app.sendGet();
    };
    
    const handleReplyResponse = (xhr) =>{
        console.log(xhr.status)
       
        app.sendGet();

    };

    //the creation of the Vue instance, contains handlers for AJAX methods
    const init = () => {

        
         app = new Vue({
            el: '#root',
            data: {
                title: 'Conversation Assistant',

                questions: null,
                tabs: ['View Questions','Post a Question','Edit Question List','Home'],
                selectedTab:'View Questions',
                filter:'',
                removeQuestion:'---',
                newQuestion:{
                    type:'openEnded',
                    author: 'Anonymous', 
                    choices: ['','','',''],
                    content:'',
               
                }   
            
            },
            methods: {
                
                //post request for creation of new question
                sendPost(){
                   
                    const questionField = document.querySelector("#questionField");
        
                    const typeSelectors = document.querySelectorAll(".typeSelector");
                        let typeSelector;
                        for(let item of typeSelectors){
                            if (item.checked === true){
                                typeSelector = item;
                                break;
                            }
                        }
                    
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST","/ask-question"); 
                    
                    xhr.setRequestHeader('Accept','application/json');
                    //xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        
                    
                    xhr.onload = () => handlePostResponse(xhr);
                    
                    //parameters contain the necessary paramaters to create a question object, and conditionally set optional paramaters before making the request
                    let formData = `content=${questionField.value}&type=${typeSelector.value}`;
                    if(this.newQuestion.author) {formData += `&author=${this.newQuestion.author}`}else{`&author=Anonymous`};
                    if(this.newQuestion.type === 'multipleChoice') formData +=`&choices=${JSON.stringify(this.newQuestion.choices)}`
                   
                    xhr.send(formData);

                    //re-render list with most recent data, which happens automagically with the 2-way binding
                    this.sendGet();       
            
            
                },

                //get request for both the admin page and the view questions page
                sendGet(){
                    console.log(this.filter)

                    //parameters contain the filter method that will be used to re-sort the list on the client side
                    const questionDataURL = `/questions?filter=${this.filter}`;
                    const xhr = new XMLHttpRequest();
                    xhr.onload = handleGetResponse;
                    xhr.open("GET", questionDataURL);
                    xhr.setRequestHeader('Accept', "text/xml");
                    xhr.send();

                },

                //post request for replying to an open ended question
                sendQReply(question){

                    
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST","/respond"); 
                    
                    xhr.setRequestHeader('Accept','application/json');
                    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        
                    
                    xhr.onload = () => handleReplyResponse(xhr);
                    
                    //parameters contain the specific question by its id, and the response string being added to its 'choices' array
                    let formData = `response=${question.newResponse}&questionId=${question.id}`;
  
                    xhr.send(formData);
                    this.sendGet();

                },

                //post request for replying to a multiple choice question
                sendMQReply(question,e){

                    let choice = e.target.value;

                    const xhr = new XMLHttpRequest();
                    xhr.open("POST","/respond-multiple-choice"); 
                    
                    xhr.setRequestHeader('Accept','application/json');
                    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        
                    
                    xhr.onload = () => handleReplyResponse(xhr);
                    
                    //parameters contain the specific question by its id, and the response string being added to its 'answers' array
                    let formData = `response=${choice}&questionId=${question.id}`;
  
                    xhr.send(formData);
                    this.sendGet();

                },

                //post request for deleting a question
                sendAdminDelete(question){
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST","/delete-question"); 
                    
                    xhr.setRequestHeader('Accept','application/json');
                    //xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        
                    
                    xhr.onload = () => handleAdminPostResponse(xhr);
                    
                    //parameter specifies which question will be deleted by it's unique identifier
                    let formData = `remove=${question.id}`;
                    
                    xhr.send(formData);
                    this.sendGet();
                    

                }
                
        
        
            }        
        });

        //render list at start
        app.sendGet();

    };

    window.onload = init;