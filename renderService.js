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
}