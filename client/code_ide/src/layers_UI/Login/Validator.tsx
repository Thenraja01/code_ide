// import { ProductContext } from '../Context/ProductContext';

// export  function ValidatorEmailorPhone(value) {
//     if(!value){
//         return 'email or phone is required'
//     }
//     const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneregex=/^\+?\d{10,15}$/;
//     if(!emailregex.test(value.trim()) && !phoneregex.test(value.trim())){
//         return "enter a valid mobile or email"
//     }
//     return null
// };

// export function validateUsername(value){
 
//     if(!value){
//         return "User name required"
//     }
//     if(value.trim().lenght<2 ){
//         return "Enter name must be least 3"
//     }
//     return null
// }
// export function validatePassword(value){
// if(!value){
//     return "Password is required"}
//  if (value.length<8) {
//     return "Password must be at least 8 characters";
//   }

//   if (!/[A-Z]/.test(value)) {
//     return "Password must contain at least one uppercase letter";
//   }

//   if (!/[a-z]/.test(value)) {
//     return "Password must contain at least one lowercase letter";
//   }

//   if (!/[0-9]/.test(value)) {
//     return "Password must contain at least one number";
//   }

//   if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
//     return "Password must contain at least one special character";
//   }
//   return null
// }
// export function ConformPassword(password,ConformPassword){
// if(!(ConformPassword)){
//         return "confirm password is required"
//     }
//     if(password!==ConformPassword){
//         return "password must be same check it !"
//     }
//     return null

// }
// export function termsValidation(data){
//   if(data===false){
//     return "please accept terms & condition"
//   }
// }
// export function ValidateIsPhone(data) {
//   const phoneRegex = /^\+?\d{10,15}$/;
//   return phoneRegex.test(data);
// }

// export function ValidateIsEmail(data) {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(data);
// }
// export function valudatefavoriee(data){
//       const { Provider } = useContext(ProductContext)
//   const favoritesid=(data)
//   if(favoritesid===Provider.Martdata.id){
//     return Provider.Martdata.map(()=>{

//     })
//   }

// }