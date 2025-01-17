"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = void 0;
const user_1 = require("./user");
const project_1 = require("./project");
const role_1 = require("./role");
const round_1 = require("./round");
const stage_1 = require("./stage");
const story_1 = require("./story");
const meeting_1 = require("./meeting");
const emailCampaign_1 = require("./emailCampaign");
const sentEmail_1 = require("./sentEmail");
const issue_1 = require("./issue");
const actionPlan_1 = require("./actionPlan");
const action_1 = require("./action");
const scoreCard_1 = require("./scoreCard");
const comment_1 = require("./comment");
const progressReport_1 = require("./progressReport");
const translationCache_1 = require("./translationCache");
const rating_1 = require("./rating");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    });
}
else {
    const config = require(`${__dirname}/../../config/config.json`)[env];
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}
exports.models = {
    sequelize,
    Sequelize,
    Role: role_1.InitRole(sequelize),
    Project: project_1.InitProject(sequelize),
    User: user_1.InitUser(sequelize),
    Round: round_1.InitRound(sequelize),
    Stage: stage_1.InitStage(sequelize),
    Story: story_1.InitStory(sequelize),
    Meeting: meeting_1.InitMeeting(sequelize),
    EmailCampaign: emailCampaign_1.InitEmailCampaign(sequelize),
    SentEmail: sentEmail_1.InitSentEmail(sequelize),
    Issue: issue_1.InitIssue(sequelize),
    ActionPlan: actionPlan_1.InitActionPlan(sequelize),
    Action: action_1.InitAction(sequelize),
    ScoreCard: scoreCard_1.InitScoreCard(sequelize),
    Comment: comment_1.InitComment(sequelize),
    ProgressReport: progressReport_1.InitProgressReport(sequelize),
    TranslationCache: translationCache_1.InitTranslationCache(sequelize),
    Rating: rating_1.InitRating(sequelize),
};
// Associations
// Project
exports.models.Project.hasMany(exports.models.Round, {
    sourceKey: "id",
    foreignKey: "projectId",
    as: "Rounds",
});
//models.Project.belongsTo(models.User,  { as: 'User', foreignKey: 'userId' });
exports.models.Project.belongsToMany(exports.models.User, {
    through: "ProjectUsers",
});
// User
/*models.User.hasMany(models.Project, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "Projects"
});*/
exports.models.User.belongsToMany(exports.models.Role, {
    through: "UserRoles",
});
exports.models.User.belongsToMany(exports.models.Project, {
    through: "ProjectUsers",
});
exports.models.User.hasMany(exports.models.Role, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "UserRoles",
});
exports.models.User.hasMany(exports.models.Comment, {
    sourceKey: "id",
    foreignKey: "userId",
});
// Round
exports.models.Round.belongsTo(exports.models.Project, {
    as: "Project",
    foreignKey: "projectId",
});
exports.models.Round.hasMany(exports.models.Meeting, {
    sourceKey: "id",
    foreignKey: "roundId",
    as: "Meetings",
});
exports.models.Round.hasMany(exports.models.Issue, {
    sourceKey: "id",
    foreignKey: "roundId",
    as: "Issues",
});
exports.models.Round.hasMany(exports.models.Rating, {
    sourceKey: "id",
    foreignKey: "roundId",
    as: "Ratings",
});
// Stage
exports.models.Stage.belongsTo(exports.models.Round, { as: "Round", foreignKey: "roundId" });
// Story
exports.models.Stage.belongsTo(exports.models.Project, {
    as: "Project",
    foreignKey: "projectId",
});
exports.models.Story.belongsToMany(exports.models.EmailCampaign, {
    through: "EmailCampaignStories",
});
exports.models.Story.belongsToMany(exports.models.Stage, {
    through: "StageStories",
});
// Meeting
exports.models.Meeting.belongsTo(exports.models.Round, { as: "Round", foreignKey: "roundId" });
// EmailCampaign
exports.models.EmailCampaign.hasMany(exports.models.SentEmail, {
    sourceKey: "id",
    foreignKey: "emailCampaignId",
    as: "SentEmails",
});
// SentEmail
exports.models.SentEmail.belongsTo(exports.models.EmailCampaign, {
    as: "EmailCampaign",
    foreignKey: "emailCampaignId",
});
// Issue
exports.models.Issue.belongsTo(exports.models.Round, { as: "Round", foreignKey: "roundId" });
exports.models.Issue.belongsToMany(exports.models.ScoreCard, {
    through: "ScoreCardIssues",
});
exports.models.Issue.hasMany(exports.models.Comment, {
    sourceKey: "id",
    foreignKey: "issueId",
});
exports.models.Issue.hasMany(exports.models.Action, {
    sourceKey: "id",
    foreignKey: "issueId",
});
exports.models.Issue.hasMany(exports.models.Rating, {
    sourceKey: "id",
    foreignKey: "issueId",
    as: "Ratings"
});
// ActionPlan
/*models.ActionPlan.hasMany(models.Action, {
  sourceKey: "id",
  foreignKey: "actionPlanId",
  as: "Actions",
});*/
// Action
exports.models.Action.belongsTo(exports.models.Issue, { as: "Issue", foreignKey: "issueId" });
/*models.Action.belongsTo(models.ActionPlan, {
  as: "ActionPlan",
  foreignKey: "actionPlanId",
});*/
// ScoreCard
// Comment
exports.models.Comment.belongsTo(exports.models.Issue, { as: "Issue", foreignKey: "issueId" });
exports.models.Comment.belongsTo(exports.models.Action, {
    as: "Action",
    foreignKey: "actionId",
});
exports.models.Comment.belongsTo(exports.models.User, { as: "User", foreignKey: "userId" });
// ProgressReport
exports.models.ProgressReport.belongsTo(exports.models.Action, {
    as: "Action",
    foreignKey: "actionId",
});
// Rating
exports.models.Rating.belongsTo(exports.models.Issue, { as: "Issue", foreignKey: "issueId" });
const force = process.env.FORCE_CSC_DB_SYNC ? true : false;
if (force) {
    sequelize.sync({ force }).then(async () => {
        try {
            const user = await exports.models.User.create({
                name: "Robert Bjarnason",
                email: "robert@citizens.is",
                encrypedPassword: "justfortesting",
                selectedAvatar: "mood",
                selectedAvatarColor: "#c93737",
                language: "en",
            });
            const roleNames = ["users", "providers", "workingGroup", "facilitator"];
            const allRoles = [];
            for (let i = 0; i < roleNames.length; i++) {
                const role = await exports.models.Role.create({
                    nameToken: roleNames[i],
                });
                allRoles.push(role);
            }
            await user.addRole(allRoles[3]);
            const project = await exports.models.Project.create({
                name: "Test Project",
                description: "This is a test project",
                userId: user.id,
                language: "en",
                publicData: {
                    service: "Health services",
                    locations: "Bosnia",
                    keyContacts: "somebody@somewhere.bi",
                    languages: "Bosnian, Croatian, Serbian & English",
                },
            });
            await user.addProject(project);
            const round = await exports.models.Round.create({
                projectId: project.id,
                userId: user.id,
            });
            const coreIssues = [
                "Health Team availability",
                "Building and facilities",
                "Emergency service",
                "Being informed",
                "Respect for patients. "
            ];
            const standards = [
                "Working hours are well-publicised and the Health Team is present and available during these hours.",
                "There is a dedicated building with a separate consultation and treatment area which ensures patient privacy.  There is a clean toilet in working order. Patient  data is stored securely.",
                "The Out of Hours emergency service (‘on call’ duty medic and referral facilities) is easy to access and up-to-date",
                "Health service users are responsible for seeking information about their rights and responsibilities, and the standards of health care they can expect, and to ask for clarifications.",
                "Patients have the right to be treated equally and with respect, with care for their personal dignity."
            ];
            const imageUrls = [
                "https://yrpri-eu-direct-assets.s3-eu-west-1.amazonaws.com/csc/clock1.png",
                "https://yrpri-eu-direct-assets.s3-eu-west-1.amazonaws.com/csc/docktors2.png",
                "https://yrpri-eu-direct-assets.s3-eu-west-1.amazonaws.com/csc/siren1.png",
                "https://yrpri-eu-direct-assets.s3-eu-west-1.amazonaws.com/csc/healthjustice.png",
                "https://yrpri-eu-direct-assets.s3-eu-west-1.amazonaws.com/csc/trustInToctors.png"
            ];
            for (let i = 0; i < coreIssues.length; i++) {
                const issue = {
                    description: coreIssues[i],
                    standard: standards[i],
                    imageUrl: imageUrls[i],
                    userId: 1,
                    type: 0,
                    state: 0,
                    roundId: round.id,
                    projectId: project.id,
                };
                await exports.models.Issue.create(issue);
            }
            const roundPublicData = {
                meetings: {},
            };
            const userOrentationMeeting = await exports.models.Meeting.create({
                roundId: round.id,
                type: exports.models.Meeting.TypeOrientation,
                state: 0,
                subState: 0,
                forUsers: true,
                forServiceProviders: false,
                userId: user.id,
            });
            roundPublicData.meetings["userOrentationMeeting"] =
                userOrentationMeeting.id;
            const providerOrentationMeeting = await exports.models.Meeting.create({
                roundId: round.id,
                type: exports.models.Meeting.TypeOrientation,
                state: 0,
                subState: 0,
                forUsers: false,
                forServiceProviders: true,
                userId: user.id,
            });
            roundPublicData.meetings["providerOrentationMeeting"] =
                providerOrentationMeeting.id;
            const userCreateCardMeeting = await exports.models.Meeting.create({
                roundId: round.id,
                type: exports.models.Meeting.TypeCreateCard,
                state: 0,
                subState: 0,
                forUsers: true,
                forServiceProviders: false,
                userId: user.id,
            });
            roundPublicData.meetings["userCreateCardMeeting"] =
                userCreateCardMeeting.id;
            const providerCreateCardMeeting = await exports.models.Meeting.create({
                roundId: round.id,
                type: exports.models.Meeting.TypeCreateCard,
                state: 0,
                subState: 0,
                forUsers: false,
                forServiceProviders: true,
                userId: user.id,
            });
            roundPublicData.meetings["providerCreateCardMeeting"] =
                providerCreateCardMeeting.id;
            const userScoringMeeting = await exports.models.Meeting.create({
                roundId: round.id,
                type: exports.models.Meeting.TypeScoring,
                state: 0,
                subState: 0,
                forUsers: true,
                forServiceProviders: false,
                userId: user.id,
            });
            roundPublicData.meetings["userScoringMeeting"] = userScoringMeeting.id;
            const providerScoringMeeting = await exports.models.Meeting.create({
                roundId: round.id,
                type: exports.models.Meeting.TypeScoring,
                state: 0,
                subState: 0,
                forUsers: false,
                forServiceProviders: true,
                userId: user.id,
            });
            roundPublicData.meetings["providerScoringMeeting"] =
                providerScoringMeeting.id;
            const actionPlanMeeting = await exports.models.Meeting.create({
                roundId: round.id,
                type: exports.models.Meeting.TypeActionPlan,
                state: 0,
                subState: 0,
                forUsers: true,
                forServiceProviders: true,
                userId: user.id,
            });
            roundPublicData.meetings["actionPlanMeeting"] = actionPlanMeeting.id;
            round.publicData = roundPublicData;
            await round.save();
        }
        catch (error) {
            console.error(error);
        }
    });
}
