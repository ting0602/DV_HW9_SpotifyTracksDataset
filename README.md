# DV_HW9_SpotifyTracksDataset
**NYCU Data Visualization and Visual Analytics HW9**

- **Objective:**
  - To implement an integrated system that can show the insight of Spotify Tracks Dataset.
- **Dataset:**
  - https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset?resource=download
  - **track_id**: The Spotify ID for the track
  - **artists**: The artists' names who performed the track. If there is more than one artist, they are separated by a `;`
  - **album_name**: The album name in which the track appears
  - **track_name**: Name of the track
  - **popularity**: **The popularity of a track is a value between 0 and 100, with 100 being the most popular**. The popularity is calculated by algorithm and is based, in the most part, on the total number of plays the track has had and how recent those plays are. Generally speaking, songs that are being played a lot now will have a higher popularity than songs that were played a lot in the past. Duplicate tracks (e.g. the same track from a single and an album) are rated independently. Artist and album popularity is derived mathematically from track popularity.
  - **duration_ms**: The track length in milliseconds
  - **explicit**: **Whether or not the track has explicit lyric**s (true = yes it does; false = no it does not OR unknown)
      - true / false
  - **danceability**: Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable
      - 0.0~1.0: 不適合 ~ 適合跳舞
  - **energy**: Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale
      - 0.0: 巴赫
      - 1.0: 死亡金屬
  - **key**: The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. `0 = C`, `1 = C♯/D♭`, `2 = D`, and so on. If no key was detected, the value is -1
  - **loudness**: The overall loudness of a track in decibels (dB)
  - **mode**: Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0
      - 大調(major): 1
      - 小調(minor): 0
  - **speechiness**: Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks
      - the closer to 1.0: 脫口秀、有聲書、詩歌
      - `> 0.66`: 所描述的曲目可能完全由口語單字組成
      - `0.33 ~ 0.66`: 包含語音的歌 (EX: 饒舌)
      - `< 0.33`: 可能非語音
  - **acousticness**: A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic
      - 0: 原聲
      - 1: 電子音、調音 (EX: auto tune)
  - **instrumentalness**: Predicts whether a track contains no vocals. "Ooh" and "aah" sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly "vocal". The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content
      - 預測曲目是否不包含人聲 (樂器聲多不多)
      - “Ooh”和“aah”聲音被視為樂器聲音。
      - 說唱或口語曲目顯然是“有聲的”。 instrumentalness 越接近 1.0，曲目不包含人聲內容的可能性就越大
  - **liveness**: Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live
      - 判斷使否為live (觀眾聲音)
      - `> 0.8`: 應該是live
  - **valence**: A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry)
      - 低: happy, cheerful, euphoric
      - 高: sad, depressed, angry
  - **tempo**: The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration
      - 節拍快慢 (看起來是6x ~ 2xx)
  - **time_signature**: An estimated time signature. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure). The time signature ranges from 3 to 7 indicating time signatures of `3/4`, to `7/4`.
  - **track_genre**: The genre in which the track belongs
      - 曲目流派 (共114種)
   
## Usage
### 1. Clone Repository
```
git clone https://github.com/ting0602/DV_HW9_SpotifyTracksDataset.git
```
### 2. Open File (index.html)
Touch or click on the bars with your mouse to get more information.
