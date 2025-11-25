'use client'
import { useState } from "react"
const BookEvent = () => {
    const [email,setEmail] = useState('');
    const[submitted,setSubmitted]=useState(false);
    const handlesubmit=(e:React.FormEvent)=>{
        e.preventDefault();
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
        }
  return (
    <div id="book-event">
   {submitted ? (
    
      <h2>Thank you for booking!</h2>)
      :(
        <form onSubmit={handlesubmit} className="flex-col-gap-4">
            <div>
                <label htmlFor="email">Email Address</label>
                <input type="email" 
                id="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)} 
                placeholder="Enter Your Email Address"
                required/> 
            </div>
            <button type="submit" className="button-submit">Submit</button>
        </form>
        
      )}
    </div>
  )
}

export default BookEvent