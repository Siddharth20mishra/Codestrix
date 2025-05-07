import {db} from "../libs/db.js"
import { pollBatchResults } from "../libs/judge0.lib.js";


export const createProblem=async(requestAnimationFrame,res)=>{
    //going to get all the data from the request body
    const {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
      } = req.body;
    //although middleware laga rkha h lekin  user ke role fir check krege

    if (req.user.role!== "ADMIN"){
        return res.status(403).json({error: "You are not allowed to create problem"})
    }
   try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
        const languageId = getJudge0LanguageId(language);
  
        if (!languageId) {
          return res
            .status(400)
            .json({ error: `Language ${language} is not supported` });
        }
  
        //
        const submissions = testcases.map(({ input, output }) => ({
          source_code: solutionCode,
          language_id: languageId,
          stdin: input,
          expected_output: output,
        }));
  
        const submissionResults = await submitBatch(submissions);
  
        const tokens = submissionResults.map((res) => res.token);
  
        const results = await pollBatchResults(tokens);
        for(let i=0;i<results.length;i++){
            const result = results[i];

            if(result.status.id !==3){
                return res.status(400).json({error: `Testcase ${i+1} failed for language ${language}`})
            }
        }
        const newProblem = await db.problem.create({
            data: {
              title,
              description,
              difficulty,
              tags,
              examples,
              constraints,
              testcases,
              codeSnippets,
              referenceSolutions,
              userId: req.user.id,
            },
          });

          return res.status(201).json(newProblem);
   }
 } catch (error) {
    
   }

    //loop through each reference solution for different language
}

export const getAllProblems=async(requestAnimationFrame,res)=>{}

export const getProblemById=async(requestAnimationFrame,res)=>{}

export const updateProblem=async(requestAnimationFrame,res)=>{}

export const deleteProblem=async(requestAnimationFrame,res)=>{}

export const getAllProblemsSolvedByUser=async(requestAnimationFrame,res)=>{}