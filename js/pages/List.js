import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p class="type-label-lg">#{{ i + 1 }}</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p><strong>Refresh rate requirement will be here</strong></p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{record.percent||100}}</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}fps</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Our Rules</h3>
                    <p>
                        Must be using inputs/fingers no more than 2, some methods may be disallowed due to your type of spamming technique.
                    </p>
                    <p>
                        Inputs resulting from the persons action have to move in a vertical motion, regardless of the speed.
                    </p>
                    <p>
                        Obviously, no functions that make an action by the person increase or decrease in any way from their raw CPS is not allowed.
                    </p>
                    <p>
                        FPS of a Spam Challenge must be from 59-360 FPS, old levels that used to be on the list with lower or higher refresh rates have been removed due to this rule.
                    </p>
                    <p>
                        Respawn Speed must be at a minimum of 0.25, although it’s not the first number to not respawn you instantly.
                    </p>
                    <p>
                        Recording of a Spam Challenge regardless of uploading or submitting must have audio of their clicks (SOMETIMES exceptional if you’re recording on iOS with Everyplay).
                    </p>
                    <p>
                        Recording of a Spam Challenge regardless of uploading or submitting must have at least the previous attempt before the completion (it is recommended to keep your raw footage just incase if someone requests it due to possible suspicion).
                    </p>
                    <p>
                        
Recording of a Spam Challenge regardless of its verification or submission footage must be the listed websites/recording platforms: Youtube, Twitch or Medal (When posting on Discord, it can first be a file but you will have to upload it to said websites for it to be accepted).
                    </p>
                    <p>
                    Spam Challenge must be at least some dedication put into it and 2 seconds long (No Decoration is required, but means you need to put more effort into it).
                    </p>
                    <h3>Banned Methods (With Causes)</h3>
                    <p>
                    Double-clicking Butterflying (Single-clicking Butterflying is an exception)
                    </p>
                    <p>
                    Any Vibration Based Methods (Dragclicking, Boltclicking, Bawlclicking, due to using vibrations from friction and not from pure momentum and speed)
                    </p>
                    <p>
                    Any Non-Handed Methods (This is self-explanatory, you’re supposed to use your hand not your vibrator)
                    </p>
                    <p>
                    Any Raking/-like Methods (Memeraking, Raking, due to it being based off of over 2 inputs/fingers and is not vertical spamming, rather in a pushing/pushing motion)
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
