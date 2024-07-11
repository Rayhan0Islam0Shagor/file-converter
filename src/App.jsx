import { useRef } from 'react';
import { useState } from 'react';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useEffect } from 'react';
import { saveAs } from 'file-saver';

const ffmpeg = createFFmpeg({ log: false });

function App() {
  const [video, setVideo] = useState('');
  const [videoName, setVideoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyped, setIsTyped] = useState('GIF');

  const formRef = useRef();

  useEffect(() => {
    const init = async () => {
      await ffmpeg.load();
    };

    init();
  }, []);

  const handleInput = (e) => {
    const file = e.target.files[0];
    setVideo(URL.createObjectURL(file));
    setVideoName(file?.name);
  };

  const handleClose = () => {
    if (!loading) {
      setVideo('');
      setVideoName('');
      setLoading(false);
      formRef.current.reset();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const name = formData.get('name') || videoName || 'output';
    const start = formData.get('start') || 0;
    const time = formData.get('time') || 10;

    const outName = isTyped === 'GIF' ? `${name}.gif` : `${name}.mp3`;
    const type = isTyped === 'GIF' ? 'image/gif' : 'audio/mp3';

    ffmpeg.FS('writeFile', name, await fetchFile(video));
    await ffmpeg.run(
      '-i',
      name,
      '-ss',
      start.toString(),
      '-t',
      time.toString(),
      '-f',
      isTyped.toLowerCase(),
      outName,
    );

    const data = ffmpeg.FS('readFile', outName);

    const url = URL.createObjectURL(new Blob([data.buffer], { type: type }));
    saveAs(url, outName);
    handleClose();
  };

  return (
    <div className="p-4 text-white bg-gray-900 min-h-dvh">
      <div className="mx-auto space-y-3 max-w-7xl">
        <div className="relative aspect-video">
          {video ? (
            <div>
              <video
                src={video}
                controls
                className="object-contain size-full"
              ></video>
              <button
                className="absolute top-0 right-0 font-bold bg-red-600 size-10"
                onClick={handleClose}
              >
                X
              </button>
              <p>Name: {videoName}</p>
            </div>
          ) : (
            <label
              className="flex items-center justify-center text-3xl font-semibold text-center text-yellow-700 capitalize border-2 border-yellow-700 border-dashed rounded-lg cursor-pointer size-full"
              htmlFor="file"
            >
              Upload a video to convert GIF or MP3
              <input
                type="file"
                accept="video/*"
                id="file"
                name="file"
                hidden
                onChange={handleInput}
              />
            </label>
          )}
        </div>
        <div>
          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="flex items-center gap-5">
              <label htmlFor="gif">
                <input
                  type="checkbox"
                  name="gif"
                  id="gif"
                  value="GIF"
                  checked={isTyped === 'GIF'}
                  onChange={(e) => setIsTyped(e.target.value)}
                />
                GIF
              </label>
              <label htmlFor="mp3">
                <input
                  type="checkbox"
                  name="mp3"
                  id="mp3"
                  value="MP3"
                  checked={isTyped === 'MP3'}
                  onChange={(e) => setIsTyped(e.target.value)}
                />
                MP3
              </label>
            </div>

            <div className="flex items-end gap-3 ">
              <div className="flex flex-col flex-1 gap-1 ">
                <label htmlFor="name">Name to use</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Ex: output"
                  className="p-4 text-black"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="start">Start</label>
                <input
                  type="number"
                  name="start"
                  id="start"
                  min={0}
                  className="p-4 text-black"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="time">Time</label>
                <input
                  type="number"
                  name="time"
                  id="time"
                  min={0}
                  max={30}
                  defaultValue={10}
                  className="p-4 text-black"
                />
              </div>

              <button
                className="px-3 py-4 text-black bg-yellow-300"
                type="submit"
                disabled={!video || loading}
              >
                {loading
                  ? 'Converting and Downloading...'
                  : `Convert to ${isTyped} and Download`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
