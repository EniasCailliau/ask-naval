import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Github from "../components/GitHub";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import Source from "../components/Source";
import {Alert} from "flowbite-react";
import Banner from "../components/Banner"

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

  const generateBio = async (e: any) => {
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
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      


      <Head>
        <title>Ask Naval Ravikant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-1 w-full flex-col items-center justify-center text-center">

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
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <p className="text-left font-medium">
              ❓ What's your question?{" "}
            </p>
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. What is specific knowledge?"
            }
          />

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Get your answer &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="space-y-10 my-10">
              {answer && (
                <>
                  <div>
                    <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
                      Naval's answer:
                    </h2>
                  </div>
                  <div className="space-y-8 flex flex-col items-center justify-center min-w-xl max-w-xl mx-auto">
                          <div
                            className="bg-white rounded-xl shadow-md p-4 transition border"
                            key={answer as string}
                          >
                            <p className="text-left">{answer}</p>
                            {sources.map((source_doc, index) => {
                              const {page_content, metadata} = source_doc
                              const {page, source} = metadata
                              return (
                                   <Source index={index+1} page={page} page_content={page_content} source={source} />
                              )
                        })}
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
