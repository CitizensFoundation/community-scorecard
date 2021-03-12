/* eslint-disable @typescript-eslint/camelcase */
import { property, html, css, LitElement, customElement } from 'lit-element';
import { nothing, TemplateResult } from 'lit-html';
//import { ifDefined } from 'lit-html/directives/if-defined';
import { YpBaseElement } from '../@yrpri/yp-base-element.js';
import { YpAccessHelpers } from '../@yrpri/YpAccessHelpers.js';
import { YpMediaHelpers } from '../@yrpri/YpMediaHelpers.js';

import '@material/mwc-tab-bar';
import '@material/mwc-fab';
import '@material/mwc-icon';
import '@material/mwc-button';
import '@material/mwc-textarea';

import { CsServerApi } from '../CsServerApi.js';
import { ShadowStyles } from '../@yrpri/ShadowStyles.js';
import { YpNavHelpers } from '../@yrpri/YpNavHelpers.js';
import { CsMeetingBase } from './cs-meeting-base.js';

import '../cs-story/cs-story.js';
import { CsStory } from '../cs-story/cs-story.js';
import { TextArea } from '@material/mwc-textarea';
import { Snackbar } from '@material/mwc-snackbar';

import { sortBy } from 'lodash-es';

export const CreateCardTabTypes: Record<string, number> = {
  Information: 0,
  ReviewCoreIssues: 1,
  CreateLocal: 2,
  Voting: 3,
  Review: 4,
};

export const IssueTypes: Record<string, number> = {
  CoreIssue: 0,
  UserIssue: 1,
  ProviderIssue: 2,
};

@customElement('cs-meeting-create-card')
export class CsMeetingCreateCard extends CsMeetingBase {
  @property({ type: Number })
  storyPageIndex: number | undefined;

  @property({ type: Number })
  coreIssueIndex = 0;

  @property({ type: Number })
  votingIssueIndex = 0;

  @property({ type: Array })
  coreIssues: Array<IssueAttributes> | undefined;

  @property({ type: Array })
  participantsIssues: Array<IssueAttributes> | undefined;

  @property({ type: Array })
  orderedParticipantsIssues: Array<IssueAttributes> | undefined;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this._getIssues();
    this._getAnyParticipantsIssues();
  }

  _getAnyParticipantsIssues() {
    if (this.meeting.forUsers) {
      this._getParticipantsIssues(IssueTypes.UserIssue);
    } else {
      this._getParticipantsIssues(IssueTypes.ProviderIssue);
    }
  }

  async _getIssues() {
    this.coreIssues = undefined;
    this.coreIssues = (await window.serverApi.getIssues(
      1 /*this.meeting.Round.projectId*/,
      IssueTypes.CoreIssue
    )) as Array<IssueAttributes> | undefined;
  }

  async _getParticipantsIssues(issueType: number) {
    this.participantsIssues = undefined;
    this.participantsIssues = (await window.serverApi.getIssues(
      1 /*this.meeting.Round.projectId*/,
      issueType
    )) as Array<IssueAttributes> | undefined;
  }

  async addIssue() {

    const element = this.$$('#addIssueInput') as HTMLInputElement;

    if (element && element.value && element.value.length>0) {
      const issue = {
        description: (this.$$('#addIssueInput') as HTMLInputElement).value,
        userId: 1,
        type: this.meeting.forUsers ? IssueTypes.UserIssue : IssueTypes.ProviderIssue,
        state: 0,
        projectId: 1 //TODO: FIX
      } as IssueAttributes;

      await window.serverApi.postIssue(
        1,
        issue
      );

      this.participantsIssues?.unshift(issue);

      this.participantsIssues = [...this.participantsIssues!];

      this.io.emit('newIssue', issue);

      (this.$$('#addIssueInput') as HTMLInputElement).value = '';
    }
  }

  _processNewIssue(issue: IssueAttributes) {
    this.participantsIssues?.unshift(issue);
    this.participantsIssues = [...this.participantsIssues!];
  }

  // UI

  static get styles() {
    return [
      super.styles,
      ShadowStyles,
      css`
        mwc-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
        }

        mwc-tab-bar {
          width: 960px;
          margin-bottom: 16px;
        }

        .header {
          height: 100px;
          font-size: var(--mdc-typegraphy-headline1-font-size, 24px);
        }

        .subjectHeader {
          margin: 32px;
          font-size: 24px;
        }

        .issueCard {
          background-color: var(--mdc-theme-surface);
          margin: 8px;
          width: 260px;
          max-width: 260px;
        }

        .voteButton {
          padding-bottom: 8px;
          padding-top: 0;
        }

        .issueName {
          padding: 16px;
        }

        .addCommentInput {
          width: 260px;
        }

        .issueVoting {
          width: 48px;
        }

        .comments {
          margin-top: 32px;
        }

        .comment {
          margin-top: 16px;
          padding: 16px;
          width: 228px;
          max-width: 2228px;
          background-color: #f7f7f7;
        }

        .addNewIssueButton {
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .votingNumber {
          margin-left: -4px;
          margin-top: 14px;
          margin-right: 0;
          padding-right: 0;
        }
      `,
    ];
  }

  updateState() {
    if (this.isAdmin) {
      this.sendState({
        tabIndex: this.selectedTab,
        isLive: this.isLive,
        storyPageIndex: this.storyPageIndex,
        votingIssueIndex: this.votingIssueIndex,
        coreIssueIndex: this.coreIssueIndex,
      } as StateAttributes);
    }
  }

  _processState(state: StateAttributes) {
    if (!this.isAdmin) {
      super._processState(state);
      if (this.isLive) {
        if (state.storyPageIndex != null && this.$$('#storyViewer')) {
          (this.$$('#storyViewer') as CsStory).setIndex(state.storyPageIndex);
        }
        if (state.coreIssueIndex != null) {
          this.coreIssueIndex = state.coreIssueIndex;
        }
        if (state.votingIssueIndex != null) {
          this.votingIssueIndex = state.votingIssueIndex;
        }
        this.selectedTab = state.tabIndex;
      }
    }
  }

  setStoryIndex(event: CustomEvent) {
    if (this.isAdmin && this.isLive) {
      this.storyPageIndex = event.detail as number;
      this.updateState();
    }
  }

  renderStory() {
    return html`
      <div class="layout horizontal center-center">
        <cs-story
          id="storyViewer"
          @cs-story-index="${this.setStoryIndex}"
        ></cs-story>
      </div>
    `;
  }

  renderCreateLocal() {
    return html`
      <div ?hidden="${this.isAdmin}" class="subjectHeader">
        ${this.meeting.forUsers
                ? this.t('createScoreCard')
                : this.t('createSelfAssessment')}
      </div>

      <div class="layout vertical center-center comments">
        <mwc-textarea
          id="addIssueInput"
          charCounter
          class="addCommentInput"
          maxLength="200"
          .label="${this.t('yourIssue')}"
        ></mwc-textarea>
        <div class="layout horizontal center-center">
          <mwc-button
            raised
            class="layout addNewIssueButton"
            @click="${this.addIssue}"
            .label="${this.t('addIssue')}"
          ></mwc-button>
        </div>
      </div>

      <div class="layout vertical center-center">
        ${this.participantsIssues?.map(issue => {
          return html`
            <div class="comment shadow-elevation-4dp shadow-transition">
              ${issue.description}
            </div>
          `;
        })}
      </div>
    `;
  }

  async voteIssueUp() {
    const issue = this.participantsIssues![this.votingIssueIndex];

    await window.serverApi.voteIssue(
      issue.id,
      1
    );
  }

  async voteIssueDown() {
    const issue = this.participantsIssues![this.votingIssueIndex];

    await window.serverApi.voteIssue(
      issue.id,
      -1
    );
  }

  renderIssue(index: number) {
    let issue: IssueAttributes;
    let showVoting = false;
    let showComments = false;
    let disableVoting = false;
    let showNumbers = false;

    if (this.selectedTab == CreateCardTabTypes.Voting) {
      issue = this.participantsIssues![index];
      showVoting = true;
    } else if (this.selectedTab == CreateCardTabTypes.Review) {
      issue = this.orderedParticipantsIssues![index];
      showVoting = true;
      disableVoting = true;
      showNumbers = true;
    } else {
      issue = this.coreIssues![index];
      showComments = true;
    }

    return html`
      <div
        class="issueCard shadow-elevation-4dp shadow-transition layout horizontal"
      >
        <div class="layout vertical">
          <div class="issueName">${issue.description}</div>
          <div class="layout horizontal" ?hidden="${!showVoting}">
            <mwc-icon-button
              icon="arrow_upward"
              ?disabled="${disableVoting}"
              class="voteButton"
              @click="${this.voteIssueUp}"
              .label="${this.t('voteUp')}"
            ></mwc-icon-button>
            <div class="votingNumber" ?hidden="${!showNumbers}">${issue.counterUpVotes}</div>
            <mwc-icon-button
              icon="arrow_downward"
              ?disabled="${disableVoting}"
              @click="${this.voteIssueDown}"
              class="voteButton"
              .label="${this.t('voteDown')}"
            ></mwc-icon-button>
            <div class="votingNumber" ?hidden="${!showNumbers}">${issue.counterDownVotes}</div>
            <div class="flex"></div>
          </div>
        </div>
      </div>

      <div class="layout vertical center-center comments" ?hidden="${!showComments}">
        <mwc-textarea
          id="addCommentInput"
          charCounter
          class="addCommentInput"
          maxLength="200"
          id="coreIssueInput"
          .label="${this.t('yourComment')}"
        ></mwc-textarea>
        <div class="layout horizontal center-center">
          <mwc-button
            raised
            class="layout addNewIssueButton"
            @click="${this.addCoreIssueCommentFromInput}"
            .label="${this.t('addComment')}"
          ></mwc-button>
        </div>
      </div>

      <div class="layout vertical self-start">
        ${issue.Comments?.map(comment => {
          return html`
            <div class="comment shadow-elevation-4dp shadow-transition">
              ${comment.content}
            </div>
          `;
        })}
      </div>
    `;
  }

  async addCoreIssueComment(comment: CommentAttributes) {
    const issue = this.coreIssues![this.coreIssueIndex];

    issue.Comments!.unshift(comment);

    this.coreIssues = [...this.coreIssues!];
  }

  _processNewComment(comment: CommentAttributes) {
    this.addCoreIssueComment(comment);
  }

  async addCoreIssueCommentFromInput() {
    const issue = this.coreIssues![this.coreIssueIndex];

    const comment = {
      content: (this.$$('#addCommentInput') as HTMLInputElement).value,
      userId: 1,
      issueId: issue.id,
      type: 0,
      status: 0,
    } as CommentAttributes;

    await window.serverApi.postIssueComment(issue.id, comment);

    this.addCoreIssueComment(comment);

    this.io.emit('newComment', comment);

    (this.$$('#addCommentInput') as HTMLInputElement).value = '';
  }

  leftCoreIssueArrow() {
    if (this.coreIssueIndex > 0) {
      this.coreIssueIndex -= 1;
      (this.$$('#addCommentInput') as TextArea).value = '';
    }
    this.updateState();
  }

  rightCoreIssueArrow() {
    if (this.coreIssueIndex < this.coreIssues!.length - 1) {
      this.coreIssueIndex += 1;
      (this.$$('#addCommentInput') as TextArea).value = '';
    }
    this.updateState();
  }

  leftVotingIssueArrow() {
    if (this.votingIssueIndex > 0) {
      this.votingIssueIndex -= 1;
    }
    this.updateState();
  }

  rightVotingIssueArrow() {
    if (this.votingIssueIndex < this.participantsIssues!.length - 1) {
      this.votingIssueIndex += 1;
    }
    this.updateState();
  }

  renderReviewCoreIssues() {
    if (this.coreIssues && this.coreIssues.length > 0) {
      return html`
        <div ?hidden="${this.isAdmin}" class="subjectHeader">
          ${this.t('reviewCoreIssues')}
        </div>

        <div class="layout horizontal center-center self-start">
          <div class="issueBack issueVoting">
            <mwc-icon-button
              ?hidden="${this.coreIssueIndex === 0}"
              ?disabled="${!this.isAdmin && this.isLive}"
              icon="arrow_back"
              @click="${this.leftCoreIssueArrow}"
            ></mwc-icon-button>
          </div>
          <div class="layout vertical center-center">
            ${this.renderIssue(this.coreIssueIndex)}
          </div>
          <div class="issueBack issueVoting">
            <mwc-icon-button
              ?hidden="${this.coreIssueIndex >= this.coreIssues!.length - 1}"
              ?disabled="${!this.isAdmin && this.isLive}"
              icon="arrow_forward"
              @click="${this.rightCoreIssueArrow}"
            ></mwc-icon-button>
          </div>
        </div>
      `;
    } else {
      return html``;
    }
  }

  renderVoting() {
    if (this.participantsIssues && this.participantsIssues.length > 0) {
      return html`
        <div ?hidden="${this.isAdmin}" class="subjectHeader">
          ${this.t('voting')}
        </div>

        <div class="layout horizontal center-center self-start">
          <div class="issueBack issueVoting">
            <mwc-icon-button
              ?hidden="${this.votingIssueIndex === 0}"
              ?disabled="${!this.isAdmin && this.isLive}"
              icon="arrow_back"
              @click="${this.leftVotingIssueArrow}"
            ></mwc-icon-button>
          </div>
          <div class="layout vertical center-center">
            ${this.renderIssue(this.votingIssueIndex)}
          </div>
          <div class="issueBack issueVoting">
            <mwc-icon-button
              ?hidden="${this.votingIssueIndex >= this.participantsIssues!.length - 1}"
              ?disabled="${!this.isAdmin && this.isLive}"
              icon="arrow_forward"
              @click="${this.rightVotingIssueArrow}"
            ></mwc-icon-button>
          </div>
        </div>
      `;
    } else {
      return html``;
    }
  }

  renderReview() {
    if (this.orderedParticipantsIssues && this.orderedParticipantsIssues.length > 0) {
      return html`
        <div ?hidden="${this.isAdmin}" class="subjectHeader">
          ${this.t('review')}
        </div>

        <div class="layout vertical center-center">
           ${ this.orderedParticipantsIssues.map( (issue, index) => {
              return html`${this.renderIssue(index)}`
           })}
        </div>
      `;
    } else {
      return html``;
    }
  }

  renderTabs() {
    if (this.isAdmin) {
      return html`
        <div class="layout vertical center-center">
          <mwc-tab-bar @MDCTabBar:activated="${this._selectTab}">
            <mwc-tab
              .label="${this.t('information')}"
              icon="info_outlined"
              stacked
            ></mwc-tab>
            <mwc-tab
              .label="${this.t('reviewCoreIssues')}"
              icon="format_list_numbered"
              stacked
            ></mwc-tab>
            <mwc-tab
              .label="${this.meeting.forUsers
                ? this.t('createScoreCard')
                : this.t('createSelfAssessment')}"
              icon="add_comment_outlined"
              stacked
            ></mwc-tab>
            <mwc-tab
              .label="${this.t('voting')}"
              icon="how_to_vote"
              stacked
            ></mwc-tab>
            <mwc-tab
              .label="${this.t('review')}"
              icon="checklist"
              stacked
            ></mwc-tab>
          </mwc-tab-bar>
        </div>
      `;
    } else {
      return nothing;
    }
  }

  renderCurrentTabPage(): TemplateResult | undefined {
    let page: TemplateResult | undefined;

    switch (this.selectedTab) {
      case CreateCardTabTypes.Information:
        page = this.renderStory();
        break;
      case CreateCardTabTypes.ReviewCoreIssues:
        page = this.renderReviewCoreIssues();
        break;
      case CreateCardTabTypes.CreateLocal:
        page = this.renderCreateLocal();
        break;
      case CreateCardTabTypes.Voting:
        page = this.renderVoting();
        break;
      case CreateCardTabTypes.Review:
        page = this.renderReview();
        break;
      }

    return page;
  }

  render() {
    return html`
      ${this.renderHeader()} ${this.renderTabs()} ${this.renderCurrentTabPage()}
    `;
  }

  // EVENTS

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('selectedTab')) {
      this.updateState();

      if (this.selectedTab==CreateCardTabTypes.Review || this.selectedTab==CreateCardTabTypes.Voting) {
        this._getAnyParticipantsIssues();
      }
    }

    if (changedProperties.has('participantsIssues') && this.participantsIssues) {
      this.orderedParticipantsIssues = sortBy(this.participantsIssues,  (item) => {
        return (item.counterDownVotes-item.counterUpVotes)
      })
    }
  }

  _selectTab(event: CustomEvent) {
    this.selectedTab = event.detail?.index as number;
  }

  /*_setSelectedTabFromRoute(routeTabName: string): void {
    let tabNumber;

    switch (routeTabName) {
      case 'process':
        tabNumber = RoundTabTypes.Process;
        break;
      case 'activities':
        tabNumber = RoundTabTypes.Activities;
        break;
      case 'analytics':
        tabNumber = RoundTabTypes.Analytics;
        break;
    }
  }*/
}
