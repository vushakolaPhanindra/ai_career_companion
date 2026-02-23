# How to customize the Interviewer Video

The current application uses online URLs for the interviewer video. If these stop working (403 or 404 errors), please follow these steps to use local videos:

1.  **Download Videos**:
    Find two stock videos of a person (interviewer) or use your own.
    *   **Idle Video**: A person listening, nodding, or looking at the camera. Name it `idle.mp4`.
    *   **Talking Video**: A person speaking. Name it `talking.mp4`.

    *Suggested free sources:*
    *   [Pexels](https://www.pexels.com/search/videos/talking%20head/)
    *   [Mixkit](https://mixkit.co/free-stock-video/talking/)
    *   [Coverr](https://coverr.co/)

2.  **Place Files**:
    Copy your `idle.mp4` and `talking.mp4` files into this directory:
    `public/videos/`

    Your folder structure should look like:
    ```
    /public
      /videos
        idle.mp4
        talking.mp4
    ```

3.  **Update Code**:
    Open `src/components/interview/Avatar.jsx` and update the constants at the top:

    ```javascript
    const IDLE_VIDEO_URL = "/videos/idle.mp4";
    const TALKING_VIDEO_URL = "/videos/talking.mp4";
    ```
