
export const usernamePattern = /^[A-Za-z0-9._-]{2,}$/;
export const emailPattern = /^[A-Za-z0-9._-]+@[a-z0-9.-]+.[a-z]{2,4}$/m;
export const passwordPattern = /^[A-Za-z\d]{8,}$/m;
export const capitalLetter = /^[A-Z]{1}[a-z]+/;
export const urlPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i;
export const imagePattern = /(.*\.(?:png|jpg|jpeg|gif|svg))/i;
export const NumberPattern = /^([1-9][0-9]+)$/;
export const PreparationPattern = /^[0-9]+[ ]{1}[a-z]+$/i;
export const VideoIdPattern =  /^[A-Za-z\d-_]{11}$/;


export const ingredientsData = [
    'Flour', 'Sugar', 'Honey', 'Rice', 'Oats', 'Vegetables', 'Fruit', 'Chicken', 'Pork', 'Lamb', 
    'Beef', 'Fish', 'Sea food', 'Rabbit', 'Mussels', 'Squids', 'Crabs', 'Shrimps', 'Snails', 'Olive oil', 
    'Oil', 'Butter', 'Sweet', 'Onion', 'Garlic', 'Parsley', 'Savory', 'Basil', 'Turmeric', 'Celery', 'Coriander', 
    'Black pepper', 'Paprika', 'Salt', 'Sea salt', 'Cornstarch', 'Peas', 'Beans', 'Lentils', 'Chili peppers', 'Peppers', 
    'Tomatoes', 'Cabbage', 'Cauliflower', 'Broccoli', 'Carrot', 'Potato', 'Eggs', 'Milk', 'Asparagus', 'Mushrooms', 'Lemon', 'Pineapple', 
    'Grapes', 'Banana', 'Orange', 'Apples', 'Pears', 'Blueberries', 'Strawberries', 'Raspberries', 'Avocado', 'Walnuts', 'Almonds', 
    'Plums', 'Cheese', 'Parmesan cheese', 'Corn', 'Yogurt', 'Cream', 'Ginger', 'Wine', 'Beer', 'Champagne', 'Parsnips', 'Water', 'Liquid cream',
    'Pumpkin', 'Spice blend', 'Olives', 'Green olives', 'Thyme', 'Chicken thighs', 'Chicken breast', 'Chicken livers', 'Chicken legs', 'Cherry tomatoes', 
    'Red wine', 'Dry red wine', 'White wine', 'Dry white wine', 'Shark fillet', 'Soy sauce', 'Corn flour', 'Spinach', 'Shallot', 'Baby spinach',
    'lemon juice', 'Lime lemon', 'Red pepper', 'Salmon fillets', 'Salmon', 'Trout', 'Mayonnaise', 'Lettuce'
];

export const liquidIngredients = ['Water', 'Milk', 'Beer', 'Wine', 'Oil', 'Olive oil', 'Champagne', 'Liquid cream', 'Yogurt', 'Red Wine', 
    'Dry red wine', 'White wine', 'Dry white wine', 'Soy sauce'];

export const getIngredientsNumbers = () => {
    let arr = [];
    for (let i = 0; i < ingredientsData.length; i++) {
        arr[i] = `${i}`;
    }

    return arr;
}

