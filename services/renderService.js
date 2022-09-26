export default class RenderService{
    constructor(){
        this.queue = [];
    }

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

    hide(selector){
        this.queue.push(() => {
            let nodes = Array.from(document.querySelectorAll(selector));
            nodes.forEach(n => n.className += " hidden");
        });
    }

    show(selector){
        this.queue.push(() => {
            let nodes = Array.from(document.querySelectorAll(selector));
            nodes.forEach(n => n.className = n.className.replace("hidden", ""));
        });
    }

    finanizeUpdates(){
        window.requestAnimationFrame(() => {
            this.queue.forEach((update) => {
                update();
            });

            this.queue = [];
        });
    }

    updateElement(target, html){
        this.queue.push(() => {
            document.querySelector(target).innerHTML = html;
        });
    }

    showResultsScreen(){
        this.queue.push(() => {
            let nodes = Array.from(document.querySelectorAll(".remove-at-end"));
            nodes.forEach(n => n.remove());
    
            let playersTable = document.querySelector(".players");
            playersTable.className = "players col-md-12";
        });

        this.finanizeUpdates();
    }

    toggleButton(selector, value){
        this.queue.push(() => {
            let button = document.querySelector(selector);
            button.disabled = value ? undefined : "disabled";
        });
    }

    showStageScreen(stage){
        this.queue.push(() => {
            let sections = ["#screen1","#screen2","#screen3"];
            let sectionToShow = `#screen${stage}`;
            let sectionsToHide = sections.filter(x => x != sectionToShow);
    
            sectionsToHide.forEach(section => {
                document.querySelector(section).className += " hidden";
            });
            const $section = document.querySelector(sectionToShow);
            $section.className = $section.className.replace("hidden", "");
        });

        this.finanizeUpdates();
    }
}