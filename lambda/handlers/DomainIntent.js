const helper = require("../helper");
const data = require("../data");
const fetch = require("node-fetch");

async function DomainIntent(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var spokenDomain = helper.getSpokenWords(handlerInput, "domain");
    var resolvedDomain = helper.getResolvedWords(handlerInput, "domain");
    var normal = await data.getRandomSpeech("NORMAL", helper.getLocale(handlerInput));
    var speakOutput = "";
    var actionQuery = await data.getRandomSpeech("ACTIONQUERY", helper.getLocale(handlerInput));

    if (resolvedDomain === undefined) {
        if (spokenDomain != undefined) {
            var domainApology = await data.getRandomSpeech("DOMAINAPOLOGY", helper.getLocale(handlerInput));
            speakOutput = `${domainApology.replace("SPOKENWORDS", spokenDomain)} ${actionQuery}`;
        }
        else {
            var domainApology = await data.getRandomSpeech("DOMAINAPOLOGY_NOSLOT", helper.getLocale(handlerInput));
            console.log(`INDEX OF "DOMAIN": ${domainApology.indexOf("DOMAIN")}`);
            if (sessionAttributes.user.Domain != undefined) domainApology = domainApology.replace("DOMAIN", sessionAttributes.user.Domain);
            else domainApology = domainApology.replace("DOMAIN", normal);
            speakOutput = `${domainApology} ${actionQuery}`;
        }
    }
    else {
        var domain = resolvedDomain[0].value.name;
        var domainValue = domain;
        if (domainValue === normal) domainValue = undefined;
        var [domainConfirmation, userDomain] = await Promise.all([
            data.getRandomSpeech("DOMAINCONFIRMATION", helper.getLocale(handlerInput)),
            data.updateUserDomain(handlerInput, domainValue)
        ]);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.user.Domain = domainValue;
        if (domain != normal) {
            speakOutput = `<amazon:domain name="${domain}">${domainConfirmation.replace("DOMAIN", domain)} ${actionQuery}</amazon:domain>`;
        }
        else speakOutput = `${domainConfirmation.replace("DOMAIN", domain)} ${actionQuery}`;
        
    }

    return handlerInput.responseBuilder
        .speak(`${speakOutput}`)
        .reprompt(actionQuery)
        //TODO: APL!
        //.withSimpleCard(`Speechcon: ${speechcon}`, `SSML SYNTAX:\n<say-as interpret-as='interjection'>${speechcon}</say-as>`)
        .getResponse();
}

module.exports = DomainIntent;