import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import Source from "../components/Source";
import {Avatar, Button} from "flowbite-react"
import { HiOutlineArrowRight, HiOutlineRefresh, HiOutlinePlus } from 'react-icons/hi';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<String>("");
  const [sources, setSources] = useState([]);


  const pollMessage = async (taskId: string, workspace: string) => {
    const response = await fetch('/api/check_job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({taskId, workspace})
    })

    if (!response.ok) {
      setLoading(false);
      return;
    }

    const {state, statusMessage, output} = await response.json()

    if (state == 'succeeded') {
      setLoading(false);
      const {answer, sources} = JSON.parse(output)
      setAnswer(answer)
      setSources(sources)
    } else if (state == 'failed') {
      setLoading(false);
      throw new Error(statusMessage);
    } else if (state == 'running') {
      setTimeout(async () => {
        pollMessage(taskId, workspace)
      }, 300);
    }
  }

  const generateAnswer = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    setSources([])

    const response = await fetch("/api/submit_job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({question: question})
    });

    if (!response.ok) {
      setLoading(false)
      throw new Error(response.statusText);
    }

    const {taskId, workspace, error} = await response.json()
    pollMessage(taskId, workspace)
  };

  return (
    <div className="max-w-5xl mx-auto justify-center py-2 min-h-screen">
      


      <Head>
        <title>Ask Naval Ravikant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-1 w-xl flex-col items-center justify-center text-center">

        <h1 className="sm:text-6xl text-4xl max-w-2xl font-bold text-slate-900">
          Ask Naval
        </h1>
        <Image
              src="/naval.png"
              width={300}
              height={300}
              alt="1 icon"
              className="p-4 sm:mb-0"
            />
        <p className="text-slate-500">Pick Naval's 🧠.</p>
        <div className="max-w-5xl w-full">
          <div className="flex mt-5 items-center space-x-3">
            <p className="text-left font-medium">
              ❓ What's your question?{" "}
            </p>
          </div>
          <div className="mt-6 flex clear-both">
      <input
        type="text"
        aria-label="chat input"
        placeholder={
          "e.g. What is specific knowledge?"
        }
        className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
        value={question}

        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            generateAnswer(e)
          }
        }}
  
        onChange={(e) => {
          setQuestion(e.target.value)
        }}
      />
      {!loading && (<Button
        type="submit"
        gradientDuoTone="greenToBlue"
        className="ml-2"
        onClick={(e) => {
          console.log("generate answer")
          generateAnswer(e)
        }}
      >
      <HiOutlineArrowRight className="h-5 w-5" />
      </Button>
      )}

      {loading && (
                  <Button
                  gradientDuoTone="greenToBlue"
                  className="ml-2 h-20"
                  disabled
                  >
                    <LoadingDots color="white" style="large" />
                  </Button>
                )}
          </div>
        </div>
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="space-y-10 my-10">
              {answer && (
                <>
                  <div className="flex flex-row">
                    <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
                      Naval's answer:
                    </h2>
                    <Button  disabled={loading}   outline={true}
               onClick={(e) => generateAnswer(e)}
               gradientDuoTone="greenToBlue">
          <HiOutlineRefresh className="h-5 w-5" />
    </Button>
                  </div>
                  <div className="space-y-8 flex flex-col items-center justify-center min-w-5xl max-w-5xl mx-auto">
                          <div
                            className="flex flex-row bg-white rounded-xl w-full shadow-md p-4 transition border"
                            key={answer as string}
                          >
                              <Avatar
                              
    img="/naval.png"
    rounded={true}
    status="online"
    statusPosition="bottom-right"
    size=""
    className="mr-5 w-20"
  >
</Avatar>


<div className="space-y-1 min-w-0.9 text-left font-medium dark:text-white">
    <div className="text-md">
      <p className="">{answer}</p>
      <div className="mt-3">
      {sources.map((source_doc, index) => {
  const {page_content, metadata} = source_doc
  const {page, source} = metadata
  return (
       <Source index={index+1} page={page} page_content={page_content} source={source} />
  )
})}
</div>
    </div>
  </div>
                            
                          </div>


<div>
                          
                        </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
    </div>
  );
};

export default Home;
