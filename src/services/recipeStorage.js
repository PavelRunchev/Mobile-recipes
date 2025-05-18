import { listAll, ref, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage" ;
import { storage } from '../firebaseConfig';


export const setRecipeImageToStorage = (image) => {
    return new Promise(function(resolve, reject) {
        uploadBytes(ref(storage, `/recipes/${image.name}`), image)
            .then((res) => {
                getDownloadURL(res.ref)
                    .then((url) => {  
                        resolve([url, res.metadata.name, 'Success']);
                    }).catch(error => reject(error));
            }).catch(error => reject(error));
    });
}




export const checkCurrentImageInUsedToStorage = (image) => {
    return new Promise(function(resolve, reject) {
        listAll(ref(storage, '/recipes/')).then(data => {
            let isUsed = false;
            for(let i of data.items) {
                const currentImage = i._location.path_.split('/')[1];
                if(currentImage == image.name) {
                    isUsed = true;
                    break;
                }
            }
            resolve(isUsed);
            reject();
        });
    });
}

export const removeImageFromStorage = (recipeImages) => {
    return new Promise(async function(resolve, reject) {
        try{
            if(recipeImages && recipeImages.length > 0) {
                let allImagesFromStorage = (await listAll(ref(storage, "/recipes/"))).items.map(el => el = el._location.path.substring(8));
                for (const el of recipeImages) {
                    if(allImagesFromStorage.includes(el.name)) {
                        const desertRef = ref(storage, `/recipes/${el.name}`);
                        await deleteObject(desertRef);
                    }
                }
            }

            resolve("remove images successfuly!");
        } catch(error) {
            console.log(error.messages);
            reject(error);
        }
    });
}

export const uploadRecipeImageFromCameraToStorage = (image) => {
    return new Promise(function(resolve, reject) {

            if(!image.hasOwnProperty('type')) {
                image.type = 'image/jpeg';
            }
            const type = image.type.split('/')[1];

            uploadBytes(ref(storage, `/recipes/${image.name}.${type}`), image, { contentType: type })
                .then((res) => {
                    getDownloadURL(res.ref)
                        .then((url) => {  
                            resolve([url, res.metadata.name, 'Success']);
                        }).catch(error => reject(error));
                }).catch(error => reject(error));
    });
}

