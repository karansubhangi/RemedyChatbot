// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    
    ActionTypes} = require('botbuilder');

   
    var _=require('underscore');
 
const TextEncoder = require('util').TextEncoder;



var updateIncident=require('./graphClient.js')
// Welcomed User property name
const WELCOMED_USER = 'welcomedUserProperty';
class TeamsConversationBot extends TeamsActivityHandler {
    constructor(userState) {
        super();

           // Creates a new user property accessor.
    // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
    this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

   
    this.userState = userState;

   

    
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

              
       
           
            const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);
            const modifiedText = TurnContext.removeMentionText(context.activity, context.activity.recipient.id);
               // (and only the first time) a user initiates a personal chat with your bot.
               if (didBotWelcomedUser === false) {
                // The channel should send the user name in the 'From' object
                const userName = context.activity.from.name;
                await context.sendActivity('You are seeing this message because this was your first message ever sent to this bot.');
                await context.sendActivity(`It is a good practice to welcome the user and provide personal greeting. For example, welcome ${ userName }.`);

                // Set the flag indicating the bot handled the user's first message.
                await this.welcomedUserProperty.set(context, true);
            } else {
                // This example uses an exact match on user's input utterance.
                // Consider using LUIS or QnA for Natural Language Processing.
                const text = context.activity.text.toLowerCase();
                switch (modifiedText) {
                case 'hello':
                case 'hi':
                    await context.sendActivity(`You said "${ teamDetails.id }"`);
                    break;
                case 'update1':
                    await this.testTeams(context);
                    break;
                case 'help':
                    await this.sendIntroCard(context);
                    break;
                default:
                    await context.sendActivity(`This is a simple Welcome Bot sample. You can say 'intro' to
                                                    see the introduction card. If you are running this bot in the Bot
                                                    Framework Emulator, press the 'Start Over' button to simulate user joining a bot or a channel`);
                }
           
      
            await next();
        }});

        // Sends welcome messages to conversation members when they join the conversation.
// Messages are only sent to conversation members who aren't the bot.
this.onMembersAdded(async (context, next) => {
    // Iterate over all new members added to the conversation
    for (const idx in context.activity.membersAdded) {
        // Greet anyone that was not the target (recipient) of this message.
        // Since the bot is the recipient for events from the channel,
        // context.activity.membersAdded === context.activity.recipient.Id indicates the
        // bot was added to the conversation, and the opposite indicates this is a user.
        if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
            await context.sendActivity('Welcome to the \'Welcome User\' Bot. This bot will introduce you to welcoming and greeting users.');
            await context.sendActivity("You are seeing this message because the bot received at least one 'ConversationUpdate' " +
                'event, indicating you (and possibly others) joined the conversation. If you are using the emulator, ' +
                'pressing the \'Start Over\' button to trigger this event again. The specifics of the \'ConversationUpdate\' ' +
                'event depends on the channel. You can read more information at https://aka.ms/about-botframework-welcome-user');
            await context.sendActivity('It is a good pattern to use this event to send general greeting to user, explaining what your bot can do. ' +
                'In this example, the bot handles \'hello\', \'hi\', \'help\' and \'intro\'. ' +
                'Try it now, type \'hi\'');
        }
    }

    // By calling next() you ensure that the next BotHandler is run.
    await next();
});
      
    }

    async run(context) {
        await super.run(context);
    
        // Save state changes
        await this.userState.saveChanges(context);
    }

    async sendIntroCard(context) {
        const card = CardFactory.heroCard(
            'Welcome to Bot Framework!',
            'Welcome to Welcome Users bot sample! This Introduction card is a great way to introduce your Bot to the user and suggest some things to get them started. We use this opportunity to recommend a few next steps for learning more creating and deploying bots.',
            ['https://aka.ms/bf-welcome-card-image'],
            [
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Get an overview',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Create Incident',
                    value: 'https://stackoverflow.com/questions/tagged/botframework'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Update Incident',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-deploy-azure?view=azure-bot-service-4.0'
                }
            ]
        );
    
        await context.sendActivity({ attachments: [card] });
    }


    async testTeams(context) {
        
        const activity = context.activity;

        const connector = context.adapter.createConnectorClient(activity.serviceUrl);

        const response = await connector.conversations.getConversationMembers(activity.conversation.id);

        let emailad='';

        response.forEach(element => {
            
            if(activity.from.id===element.id)
            {
                emailad=element.email;
            }
        });
        const teamDetails = await TeamsInfo.getTeamDetails(context);
        
      let messageDetails= await  updateIncident(emailad,context.activity.conversation.id,teamDetails.name);
     
      await  context.sendActivity(`Your message "${ messageDetails}"`);
    }

    
}
module.exports.TeamsConversationBot = TeamsConversationBot;
