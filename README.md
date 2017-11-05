# Trident

Chrome extension which provides enhancements for the music review website
[Pitchfork.com](https://pitchfork.com)

# Features

- Load YouTube video for currently viewed album review
    + Gets the video by scraping the page for the furthest scrolled review
      available.
        + Can be refreshed by clicking extension icon
    + ![Load YouTube video example](./meta/load-youtube-video.png)
- Filter the Pitchfork review list by score, published year, and genre
    + Also displays score and year published on the page, which is not
      default behavior of Pitchfork.
    + ![Filter reviews example](./meta/filter-reviews.png)

# Dependencies

- NodeJS
- TypeScript

# Build

To build:

1. Clone the repository
2. Run `npm install`
3. Run `bower install`
4. Run `npm run-script build` or `npm run-script watch`

# Run

To use Trident, open the Chrome extensions menu and click *Load unpacked
extension* and select the dist directory of this repo.

# Project Structure Notes

The main project files which are intended to be edited exist in the `src`
directory. These are the TypeScript files which
[WebPack](https://webpack.js.org/) will output into the `dist` directory.
However, for convenience, some files are tracked and modified directly in
`dist`. They are:

+ `dist/js/background.js`
+ `dist/js/web_accessible.js`
+ `dist/images`

The reason for this is that these files are easier to modify as plain
JavaScript and I'd rather that WebPack did not compile them.

The images which are actually displayed as part of the chrome extension
are contained in there as well.

Also, Bower installs dependent JavaScript libraries into `dist/js/lib`.

# Roadmap

- YouTube video loading
    + Display list of videos for search query
    + Use spotify to get entire album if available and is user preference
    + Make loading more user-interactive as right now it doesn't request and
      it's not intuitive that it loads the furthest scrolled review.
        + For example, if you scroll back up the page, it should offer
          a prompt to let you switch songs.
    + Need a user-interactive way to hide the YouTube videos
- Filtering
    + Filtering currently uses a timer and determines if necessary to show
      or hide items if new items have appeared after scrolling.
        + Needs to change to only happen if more reviews appear on the
          page or if the custom UI input changes.
- Better Icon Art
    + Currently just have an icon of a pitchfork. Want a cool trident.
    + No icon for the large image yet.

