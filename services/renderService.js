export default class RenderService{
    render(template, values){
        let renderedHtml = document.querySelector(`script#${template}`).innerHTML;;

        let keys = Object.keys(values);

        keys.forEach(key => {
            var value = values[key];
            var replacementRegEx = new RegExp(`{${key.toString().toLowerCase()}}`, 'gi');

            renderedHtml = renderedHtml.replace(replacementRegEx, value);
        });

        return renderedHtml;
    }

    updateElement(target, html){
        let element = document.querySelector(target);

        element.innerHTML = html;
    }

    showResultsScreen(){
        let nodes = Array.from(document.querySelectorAll(".remove-at-end"));
        nodes.forEach(n => n.remove());

        let playersTable = document.querySelector(".players");
        playersTable.className = "players col-md-12";
    }

    toggleButton(selector, value){
        let button = document.querySelector(selector);
        button.disabled = value ? "disabled" : undefined;
    }

    showStageScreen(stage){
        let sections = Array.from(document.querySelectorAll("section"));
        sections.forEach(s => s.className = "hidden");

        document.querySelector(`#screen${stage}`).className = "";
    }
}