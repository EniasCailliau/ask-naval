from typing import Type, Dict, Any

from langchain import PromptTemplate
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from steamship import Steamship
from steamship.invocable import Config
from steamship.invocable import PackageService, post
from steamship_langchain import OpenAI
from steamship_langchain.vectorstores import SteamshipVectorStore

qa_prompt_template = """I want you to ANSWER a QUESTION based on the following pieces of CONTEXT. 

    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    Your ANSWER should be analytical and straightforward. 
    Try to share deep, thoughtful insights and explain complex ideas in a simple and concise manner. 
    When appropriate use analogies and metaphors to illustrate your point. 
    Your ANSWER should have a strong focus on clarity, logic, and brevity.


    CONTEXT: {summaries}

    QUESTION: {question}
    ANSWER:
    """
QA_PROMPT = PromptTemplate(
    template=qa_prompt_template, input_variables=["summaries", "question"]
)


class AskMyBook(PackageService):
    class AskMyBookConfig(Config):
        index_name: str

    config: AskMyBookConfig

    def __init__(
            self,
            *args,
            **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.doc_index = SteamshipVectorStore(client=self.client,
                                              index_name=self.config.index_name,
                                              embedding="text-embedding-ada-002"
                                              )

        self.qa_chain = self._get_chain()

    @classmethod
    def config_cls(cls) -> Type[Config]:
        return cls.AskMyBookConfig

    def _get_chain(self):
        return load_qa_with_sources_chain(OpenAI(client=self.client, temperature=0, verbose=True),
                                          chain_type="stuff",
                                          prompt=QA_PROMPT,
                                          verbose=False)

    @post("/answer")
    def answer(self, question: str = "") -> Dict[str, Any]:
        """Returns an answer in response to a question."""
        docs = self.doc_index.similarity_search(query=question, k=2)
        result = self.qa_chain(
            {"question": question, "input_documents": docs}
        )

        return {"answer": result["output_text"], "sources": result["input_documents"]}


if __name__ == "__main__":
    client = Steamship()
    package = AskMyBook(client=client, config={"index_name": "ask-naval-2"})
    response = package.answer(
        question="What is specific knowledge?",
    )
    print(f"Answer: {response['answer']}")
    print(f"Sources: ")
    for source in response["sources"]:
        print(source)