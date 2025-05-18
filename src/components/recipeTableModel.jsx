import React from 'react';

function RecipeTableModel({ recipe, index, allUsers }) {
    const creator = allUsers.find(u => u.userUID == recipe.creatorUID);

    return (
        <tr>
            <td className="label-cell">{index + 1}</td>
            <td className="numeric-cell text-align-left underline-none">{recipe.name}</td>
            <td className="numeric-cell text-align-left">{recipe.category}</td>
            <td className="numeric-cell text-align-left">{creator && creator.email}</td>
            <td className="numeric-cell text-align-left">{recipe.sharing ? 'True' : 'False'}</td>
            <td className="numeric-cell text-align-left">{recipe.rating}</td>
            <td className="numeric-cell text-align-left">{recipe.date}</td>
        </tr>
    )
}

export default RecipeTableModel;