/**
 * Returns the header part needed by all pages.
 * @returns {string}
 */
const Header = () => `
<html>
    <head>
    </head>
    <body>
`;

/**
 * Returns the footer part needed by all pages.
 * @returns {string}
 */
const Footer = () => `
    </body>
</html>
`;

/**
 * Returns the main form used after login.
 * @param {Object} user - The user session returned by passport.
 * @returns {string}
 */
const MainForm = (user) => `
<p>Hello, ${user.username}. View your <a href="/profile">profile</a>.</p>
<p>View SamLab's <a href="/api/v1/tweets/samlabs">tweets</a>.</p>
<form method="post" action="/api/v1/tweets">
    <input name="tweet" type="text"/>
    <button type="submit">Submit</button>
</form>
`;

/**
 * Returns a link to allow login through twitter.
 * @returns {string}
 */
const LoginWithTwitter = () => `<a href="/login/twitter">Log In with Twitter</a>`;
/**
 * Returns the profile page shown after login.
 * @param {Object} user - The user session returned by passport.
 * @returns {string}
 */
const Profile = (user) => `
<p>ID: ${user.id}</p>
<p>Username: ${user.username}</p>
<p>Name: ${user.displayName}</p>
${
  user.emails ?
    `<p>Email: ${user.emails[0].value}</p>` :
    ``
}`;
/**
 * Returns a link that navigates to the homepage. Shown after successfully creating a tweet.
 * @returns {string}
 */
const BackToMain = () => `
<p>Tweet Created!</p>
<a href="/">Back to home.</a>
`;

module.exports = {
  Header,
  Footer,
  MainForm,
  LoginWithTwitter,
  Profile,
  BackToMain
};
