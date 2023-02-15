from typing import List

from langchain import PromptTemplate
from langchain.chains import ChatVectorDBChain
from langchain.chains.llm import LLMChain
from langchain.chains.question_answering import load_qa_chain
from steamship import Steamship
from steamship.invocable import PackageService, post
from steamship_langchain import OpenAI
from steamship_langchain.vectorstores import SteamshipVectorStore


class AskMyBook(PackageService):

    def __init__(
            self,
            *args,
            **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.qa_chain = self._get_chain()

    def _get_chain(self):
        doc_index = SteamshipVectorStore(client=self.client,
                                         index_name="ask-naval",
                                         embedding="text-embedding-ada-002"
                                         )
        condense_question_prompt_template = """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:"""
        condense_question_prompt = PromptTemplate.from_template(condense_question_prompt_template)

        qa_prompt_template = """I want you to ANSWER a QUESTION based on the following pieces of CONTEXT. 

        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        Your ANSWER should be analytical and straightforward. 
        Try to share deep, thoughtful insights and explain complex ideas in a simple and concise manner. 
        When appropriate use analogies and metaphors to illustrate your point. 
        Your ANSWER should have a strong focus on clarity, logic, and brevity.
    
    
        CONTEXT: {context}
        
        QUESTION: {question}
        ANSWER:
        """
        qa_prompt = PromptTemplate(
            template=qa_prompt_template, input_variables=["context", "question"]
        )

        doc_chain = load_qa_chain(OpenAI(client=self.client, temperature=0, verbose=True),
                                  chain_type="stuff",
                                  prompt=qa_prompt,
                                  verbose=True)
        question_chain = LLMChain(  # Chain to condense previous input
            llm=OpenAI(client=self.client, temperature=0, verbose=True),
            prompt=condense_question_prompt,
        )
        return ChatVectorDBChain(
            vectorstore=doc_index,
            combine_docs_chain=doc_chain,
            question_generator=question_chain,
        )

    @post("/generate")
    def generate(self, question: str = "") -> List[str]:
        """Returns a Twitter bio of the desired vibe."""
        chat_history = []
        result = self.qa_chain(
            {"question": "What is specific knowledge", "chat_history": chat_history}
        )

        return [result["answer"]]


if __name__ == "__main__":
    package = AskMyBook(client=Steamship(), config=None)
    bios = package.generate(
        question="What is specific knowledge?",
    )
    for bio in bios:
        print(f"- {bio}")

    print(
        "\nAfter customizing this backend, run `ship deploy` to push it to the cloud, then use from your NextJS functions.")
