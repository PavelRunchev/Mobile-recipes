
export const formatRecipeText = (text) => {
    let content = '';

    if(text != undefined && text.length > 0) {
        let instruct = text.split('.');
        
        while(instruct.length > 0) {
            content += '\n' + '\t' + instruct.splice(0, 3);
        }
    }

    return content;
}
