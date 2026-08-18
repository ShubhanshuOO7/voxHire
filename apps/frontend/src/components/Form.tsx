import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import axios from 'axios'
import { BACKEND_URL } from '@/lib/config'
import { data, useNavigate } from 'react-router-dom'
interface Input{
  githubUrl : string,
  resume : File | null
}
const Form = () => {
  const navigate = useNavigate()
    const[input,setInput]  = useState<Input>({
      githubUrl : "",
      resume : null
    })
    async function onSubmit(){
      try {
          const formData = new FormData();
          formData.append("githubUrl",input.githubUrl)
          formData.append("resume",input.resume!)
           if(!input.githubUrl){
               toast("Please provide valid github URL")
               return
           }
           const res =  await axios.post(`${BACKEND_URL}/api/v1/user/pre-interview`,formData,{
              headers:{
                  "Content-Type" : "multipart/form-Data"
              }
           })
           if(res.data){
             navigate(`/Interview?id=${res.data.interviewId}`)
           }
      } catch (error) {
        console.log(error)
      }
        
    }
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div>
        <h2 className="text-2xl font-bold">AI Interview Kickstart</h2>
       {/* <div className="m-5">
          <Input placeholder="Linkedin URL" onChange={(e)=>{setLinkedin(e.target.value)}}/>
       </div> */}
        <div className="m-5">
          <Input placeholder="Github URL" onChange={(e)=>setInput({...input,githubUrl: e.target.value})}/>
        </div>
        <div>
          <Input type='file' placeholder='Upload Resume PDF' name='resume'
          accept='application/pdf' onChange={(e)=>{
            const file = e.target.files?.[0]
            if(file)setInput({...input,resume: file})
          }}/>
        </div>
        <div className="m-5 flex justify-center">
        <Button onClick={onSubmit} className="">Start Interview</Button>
        </div>
      </div>
    </div>
  )
}

export default Form