import { onValue, ref, set, get, remove, push } from "firebase/database" ;
import { database } from '../firebaseConfig';


export const setRecipeFromDB = (newRecipe) => {
    return new Promise(function(resolve, reject) {
        set(push(ref(database, 'recipes')), newRecipe).then(() => {
            onValue(ref(database, '/recipes/'), (data) => {
                if(data.exists()) {

                    let currentRecipe = {};
                    for (const key in data.val()) {
                        let obj = data.val()[key];
                        if(obj.recipeId == newRecipe.recipeId) {
                            currentRecipe = obj;
                            currentRecipe.id = key;
                            break;
                        }
                    }

                    resolve([currentRecipe, "Success"]);
                    reject();
                }
            });
        });
    });
};

export const getAllRecipesFromDB = () => {
    return new Promise(function(resolve, reject) {
        onValue(ref(database, '/recipes/'), (data) => {
            let arrayFromRecipes = [];
            if(data.exists()) {
                for (const key in data.val()) {
                    let obj = data.val()[key];
                    obj.id = key;
                    arrayFromRecipes.push(obj);
                }
            }
            resolve(arrayFromRecipes);
            reject();
        });
    });
}

export const updateRecipeInDB = (recipe) => {
    return new Promise(function(resolve, reject) {
        set(ref(database, "/recipes/" + recipe.id), recipe)
            .then(() => {
                resolve('Success');
                reject();
        });
    });
}

export const getCreatorRecipe = (uid) => {
    return new Promise(function(resolve, reject) {
        onValue(ref(database, '/users/'), (data) => {
            if(data.exists()) {
                if(uid != undefined) {
                    const currentCreator = Object.entries(data.val()).filter(el => el[1].userUID == uid);
                    if(currentCreator.length >= 1)
                        resolve(currentCreator[0][1].username);
                    else
                        reject(currentCreator);
                } 
            } else {
                reject(data);
            }
        });
    });
}

export const removeRecipeFromDB = (id) => {
    return new Promise(function(resolve, reject) {
        remove(ref(database, "/recipes/" + id))
            .then(() => {
                resolve();
                reject();
        });
    });
}

export const getImagesCommentUrl = () => {
    return new Promise(function(resolve, reject) {

        onValue(ref(database, '/imagesUrl/'), (data) => {
            if(data.exists()) {
                let arr = [];
                for (const key in data.val()) {
                    arr.push(data.val()[key].imageUrl);
                }

                resolve(arr);
            } else {
                reject();
            }
        });
    });
}

// export const getRecipesFromCurrentUser = (uid) => {
//     return new Promise(function(resolve, reject) {

//         onValue(ref(database, '/recipes/'), (data) => {
//             let arrayFromRecipes = [];
//             if(data.exists()) {
                
//                 for (const key in data.val()) {
//                     let obj = data.val()[key];
                    
//                     if(obj.creatorUID == uid) {
//                         obj.id = key;
//                         arrayFromRecipes.push(obj);
//                     }
//                 }
//             }

//             resolve(arrayFromRecipes);
//             reject();
//         });
//     });
// }




//TODO implement image to ImageUrl!!!!

export const saveImageUrl = (urlObj) => {
    return new Promise(function(resolve, reject) {
        set(push(ref(database, 'imagesUrl')), urlObj)
            .then(() => {
                resolve();
                reject();
            });
    });
}


export const removeRecipeMessage = (recipe, id) => {
    return new Promise(function(resolve, reject) {

        const filtredComments = recipe.comments.filter(m => m.id != id);
        let updatedRecipe = recipe;
        updatedRecipe.comments = filtredComments;

        set(ref(database, "/recipes/" + recipe.id), updatedRecipe)
            .then(() => {
                resolve('Success');
                reject();
        });
    });
}


