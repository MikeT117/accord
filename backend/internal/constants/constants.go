package constants

const DetailBodyEmpty = "Body Is Empty"
const DetailBodyNotParseable = "Unable To Parse Body"
const DetailBodyInvalid = "Body Validation Failed"

const DetailAccountExists = "Account Already Exists"
const DetailIncorrectUsernamePassword = "Incorrect Username And/Or Password"

const DetailUnauthorizedAction = "You Are Not Authorized To Perform This Action"

const DetailAccountNotFound = "Account Not Found"
const DetailTweetNotFound = "Tweet Not Found"

const DetailTweetDeleted = "Tweet Deleted"

const DetailAccountBlockedBy = "This Account Has Blocked You"
const DetailAccountBlocked = "You Have Blocked This Account"
const DetailPrivateUnfollowed = "This Account Is Private, You Must Be Following To Perform This Action"

const DetailQuotedRetweetedAccountBlockedBy = "The Quoted/Retweeted Tweet's Account Has Blocked You"
const DetailQuotedRetweetedAccountBlocked = "You Have Blocked The Quoted/Retweeted Tweet's Account"
const DetailQuotedRetweetedPrivateUnfollowed = "The Quoted/Retweeted Tweet's Account Is Private, You Must Be Following To Perform This Action"

const DetailRetweetRetweet = "You Can't Quote Retweet Or Existing Quote Tweet"

const DetailAlreadyFollowed = "Account Already Followed"
const DetailAlreadyBlocked = "Account Already Blocked"

const DetailBlockSelf = "You Cannot Block Yourself"
const DetailFollowSelf = "You Cannot Follow Yourself"

const DetailUnblockSelf = "You Cannot Unblock Yourself"
const DetailUnfollowSelf = "You Cannot Unfollow Yourself"

const DetailNotFollowed = "Account Not Followed"
const DetailNotBlocked = "Account Not Blocked"

const DetailTweetSaved = "Tweet Already Saved"
const DetailTweetNotSaved = "Tweet Not Saved"

const DetailTweetLiked = "Tweet Already Liked"
const DetailTweetNotLiked = "Tweet Not Liked"

const DetailHashtagNotFound = "Hashtag Not Found"
const DetailUnauthorized = "This Resource Requires Authentication"

const DetailsParseTweetId = "Unable To Parse Tweet ID"

// Role permissions offsets
const (
	VIEW_GUILD_CHANNEL_PERMISSION = iota
	MANAGE_GUILD_CHANNELS_PERMISSION
	CREATE_CHANNEL_MESSAGE_PERMISSION
	MANAGE_CHANNEL_MESSAGES_PERMISSION
	MANAGE_GUILD_PERMISSION
	GUILD_ADMIN_PERMISSION
	GUILD_SUPER_ADMIN_PERMISSION
	GUILD_OWNER_PERMISSION
	VIEW_GUILD_MEMBERS_PERMISSION
	CREATE_CHANNEL_PIN_PERMISSION
)

// User public flags offsets
const ALLOW_GUILD_MEMBER_DMS = 0
const ALLOW_FRIEND_REQUESTS = 1
