import { onValue, ref, set, get, remove, push } from "firebase/database" ;
import { database } from '../firebaseConfig';

export const getAllCategoriesFromDB = () => {
    return new Promise(function(resolve, reject) {
        onValue(ref(database, '/categories/'), (data) => {
            if(data.exists()) {
                const arrayFromCategories = Object.entries(data.val()).map(el => { 
                    return {id: el[0], name: el[1].name}
                });

                resolve(arrayFromCategories);
                reject();
            }
        });
    });
};

export const setCategoryFromDB = (newCategory) => {
    return new Promise(function(resolve, reject) {
        set(push(ref(database, 'categories')), newCategory).then(() => {
            onValue(ref(database, '/categories/'), (data) => {
                if(data.exists()) {
                    const currentCategory = Object.entries(data.val()).map(el => { 
                        return {id: el[0], name: el[1].name}
                    }).filter(el => el.name == newCategory.name);
        
                    resolve(currentCategory);
                    reject();
                }
            });
        });
    });
};

export const removeCategoryByIDFromDB = (id) => {
    return new Promise(function(resolve, reject) {
        remove(ref(database, '/categories/' + id)).then(() => {
            resolve("delete is success!");
            reject();
        });
    });
};





