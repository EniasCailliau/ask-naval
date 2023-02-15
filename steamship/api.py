from enum import Enum
from typing import List
from steamship import Steamship
from steamship.invocable import PackageService, post


class Vibe(str, Enum):
    professional = "Professional"
    casual = "Casual"
    funny = "Funny"

class TwitterBioGeneratorPackage(PackageService):
    @post("/generate")
    def generate(self, bio: str = "", vibe: Vibe = Vibe.professional) -> List[str]:
        """Returns a Twitter bio of the desired vibe."""
        
        if type(vibe) == str:
            vibe = Vibe(vibe)

        bio = bio.strip()
        if len(bio) and bio[-1] != '.':
            bio = f"{bio}."


        prompt_prefix = f"Generate 2 {vibe.value} twitter bios with no hashtags and clearly labeled \"1.\" and \"2.\". "
        prompt_suffix = f"Make sure each generated bio is at least 14 words and at max 20 words and base them on this context: {bio}"
        prompt_infix = f""

        if vibe == Vibe.funny:
            prompt_infix = "Make sure there is a joke in there and it's a little ridiculous. "

        prompt = f"{prompt_prefix}{prompt_infix}{prompt_suffix}"

        llm = self.client.use_plugin('gpt-3', config={
            "max_words": 80
        })
        
        output = llm.generate(prompt)

        # Now parse the output.
        parts = output.split('2.')
        if len(parts) != 2:
            return [output]
        
        first_one = parts[0].strip()
        second_one = parts[1].strip()

        if '1.' in first_one:
            first_one = first_one.split('1.')[1].strip()

        return [first_one, second_one]


if __name__ == "__main__":
    print("Generating bios...")
    package = TwitterBioGeneratorPackage(Steamship())
    bios = package.generate(
        bio="Senior Developer Advocate @vercel. Tweeting about web development, AI, and React / Next.js. Writing nutlope.substack.com.",
        vibe = Vibe.professional
    )
    for bio in bios:
        print(f"- {bio}")

    print("\nAfter customizing this backend, run `ship deploy` to push it to the cloud, then use from your NextJS functions.")