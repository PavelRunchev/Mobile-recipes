
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const GetCurrentDate = (date) => {
    const hour = date.getHours();
    let minutes = date.getMinutes();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const weekDay = date.getDay();

    if(minutes < 10)
        minutes = '0' + minutes;

    return `${days[weekDay]}, ${day} ${months[month]} ${year}, ${hour}:${minutes}`;
}

export const convertDateFromComment = (date) => {
    const hour = date.getHours();
    let minutes = date.getMinutes();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const weekDay = date.getDay();

    if(minutes < 10)
        minutes = '0' + minutes;

    return `${hour}:${minutes}, ${day} ${months[month]} ${year}`;
}


export const sortAllCommentsByCreateDateInDescending = (arr) => {
    if(arr == undefined)
        return [];
    
    return arr.sort((a, b) => b.createDate - a.createDate);
}

