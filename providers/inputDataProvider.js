export default class InputDataProvider{
    constructor(){

    }

    getInputValue(selector){
        return document.querySelector(selector).value;
    }

    resetAndRefocusOnInput(selector){
        let input = document.querySelector(selector);
        input.value = "";
        input.focus();
    }
}