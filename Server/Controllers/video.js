import videofile from "../Models/videofile.js";
export const uploadvideo=async(req,res)=>{
    if(req.file=== undefined){
        res.status(404).json({message:"plz upload a mp.4 video file only"})
    }else{
        try {
            const file=new videofile({
                videotitle:req.body.title,
                filename:req.file.originalname,
                filepath:req.file.path,
                filetype:req.file.mimetype,
                filesize:req.file.size,
                videochanel:req.body.chanel,
                uploader:req.body.uploader,
            })
            // console.log(file)
            await file.save()
            res.status(200).send("File uploaded successfully")
        } catch (error) {
            res.status(404).json(error.message)
            return
        }
    }
}

export const getallvideos=async(req,res)=>{
    try {
        const files=await videofile.find();
        res.status(200).send(files)
    } catch (error) {
        res.status(404).json(error.message)
            return
    }
}

export const likevideo = async (req, res) => {
  const { action } = req.body;
  const { id } = req.params;

  try {
    const video = await videofile.findById(id); 
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (action === 'like') {
      video.Like += 1;
    } else if (action === 'unlike') {
      video.Like = Math.max(video.Like - 1, 0);
    }

    await video.save();
    res.status(200).json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
