import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import axios from 'axios'
import { BACKEND_URL } from '@/lib/config'
import { useNavigate } from 'react-router-dom'

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
      if(!input.githubUrl){
        toast.error("Please provide a valid GitHub URL")
        return
      }
      if(!input.resume){
        toast.error("Please upload your resume")
        return
      }

      const formData = new FormData();
      formData.append("githubUrl", input.githubUrl)
      formData.append("resume", input.resume)

      const res = await axios.post(`${BACKEND_URL}/api/v1/user/pre-interview`, formData, {
        headers: {
          "Content-Type": "multipart/form-Data"
        }
      })

      if(res.data){
        navigate(`/Interview?id=${res.data.interviewId}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to start interview. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              voxHire
            </span>
          </div>
          <nav className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Home</a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Features</a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">About</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Start Your
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Interview
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Upload your resume and GitHub profile to begin your personalized AI-powered interview experience. Get ready to showcase your skills!
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">GitHub Profile URL</label>
                <Input
                  placeholder="https://github.com/username"
                  value={input.githubUrl}
                  onChange={(e) => setInput({...input, githubUrl: e.target.value})}
                  className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Resume (PDF)</label>
                <div className="relative">
                  <Input
                    type='file'
                    accept='application/pdf'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if(file) setInput({...input, resume: file})
                    }}
                    className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {input.resume && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <span className="text-green-500">✓</span> {input.resume.name}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={onSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-semibold shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:scale-105"
              >
                Start Interview
              </Button>
            </div>
         </div>
         
          <div className="relative">
            <img
              src="/public/voxHire.png"
              alt="AI interviewer"
              className="w-full h-auto rounded-2xl shadow-2xl shadow-indigo-200 mt-20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form