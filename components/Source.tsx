import { Modal } from "flowbite-react";
import { useState } from "react";

export default function Source({ index, page, page_content, source }: { index?: number, page?: string, page_content?: string, source?: string }) {

  const [visible,setVisible]=useState(false)

  var parsed_content = page_content?.replace(/↓/g,'\n');


  return (
     <div key={index} >
    <p className="text-left pt-2  text-blue-600 hover:underline" onClick={()=>setVisible(true)}>
      🧠 Source {index}: {source}  - Page {page}
    </p>
    <Modal
      show={visible}
      onClose={()=>setVisible(false)}
    >
      <Modal.Header>
        {source} - Page {page}
              </Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {parsed_content}
          </p>
        </div>
      </Modal.Body>
    </Modal>
  </div> 
  );
}
