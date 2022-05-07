import { writeFile } from 'fs';
  
// Data which will write in a file.
let data = "Learning how to write in a file."
  
// Write data in 'Output.txt' .
writeFile('../Leaderboard/text.txt', data, (err) => {
      
    // In case of a error throw err.
    if (err) throw err;})