import { listAll, ref, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage" ;
import { storage } from '../firebaseConfig';


export const uploadUserAvatarFileToStorage = (image) => {
    return new Promise(function(resolve, reject) {
        uploadBytes(ref(storage, `/avatars/avatar-${image.name}`), image)
            .then((res) => {
                getDownloadURL(res.ref)
                    .then((url) => {  
                        resolve([url, res.metadata.name]);
                    }).catch(error => reject(error));
            }).catch(error => reject(error));
    });
}

export const uploadUserAvatarFromCameraToStorage = (image, userUID) => {
    return new Promise(function(resolve, reject) {

            const type = image.type.split('/')[1];
            uploadBytes(ref(storage, `/avatars/avatar-${userUID}.${type}`), image, { contentType: type || 'image/jpeg' })
                .then((res) => {
                    getDownloadURL(res.ref)
                        .then((url) => {  
                            resolve([url, res.metadata.name]);
                        }).catch(error => reject(error));
                }).catch(error => reject(error));
    });
}