import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { LoginLayoutComponent } from './shared/layouts/login-layout/login-layout.component';
import {AuthGuard} from './shared/classes/auth.guard'
import {AdminGuard} from './shared/classes/admin.guard'
import {ActiveUserGuard} from './shared/classes/active.guard'
import {ModeratorGuard} from './shared/classes/moderator.guard'
import { PeopleLayoutComponent } from './shared/layouts/people-layout/people-layout.component';
import { FriendsPageComponent } from './friends-page/friends-page.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { ChatLayoutComponent } from './shared/layouts/chat-layout/chat-layout.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout.component';
import { UsersPageComponent } from './users-page/users-page.component';
import { UsersFormComponent } from './users-page/users-form/users-form.component';
import { PicturesPageComponent } from './pictures-page/pictures-page.component';
import { PicturesFormComponent } from './pictures-page/pictures-form/pictures-form.component';
import { InstitutionsPageComponent } from './institutions-page/institutions-page.component';
import { InstitutionsFormComponent } from './institutions-page/institutions-form/institutions-form.component';
import { InstitutionsDeleteComponent } from './institutions-page/institutions-delete/institutions-delete.component';
import { EventsPageComponent } from './events-page/events-page.component';
import { EmoBotPageComponent } from './emo-bot-page/emo-bot-page.component';
import { BotLayoutComponent } from './shared/layouts/bot-layout/bot-layout.component';
import { AdminBotPageComponent } from './admin-bot-page/admin-bot-page.component';
import { AdminBotFormComponent } from './admin-bot-page/admin-bot-form/admin-bot-form.component';
import { AdminEventsPageComponent } from './admin-events-page/admin-events-page.component';
import { AdminEventsFormComponent } from './admin-events-page/admin-events-form/admin-events-form.component';
import { GroupLayoutComponent } from './shared/layouts/group-layout/group-layout.component';
import { GroupPageComponent } from './group-page/group-page.component';
import { PhotolikesPageComponent } from './photolikes-page/photolikes-page.component';
import { AdminTablePageComponent } from './admin-table-page/admin-table-page.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { MoneyTableComponent } from './group-page/money-table/money-table.component';
import { PublicPhotolikesPageComponent } from './public-photolikes-page/public-photolikes-page.component';
import { PublicEventsPageComponent } from './public-events-page/public-events-page.component';
import { GamesComponent } from './games/games.component';
import { GameLayoutComponent } from './games/game-layout/game-layout.component';
import { Game1Component } from './games/game1/game1.component';
import { Game2Component } from './games/game2/game2.component';
import { RatingComponent } from './games/rating/rating.component';
import { Game3Component } from './games/game3/game3.component';
import { Game4Component } from './games/game4/game4.component';
import { Game5Component } from './games/game5/game5.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { RegistrPageComponent } from './registr-page/registr-page.component';
import { VideoRoomsPageComponent } from './video-rooms-page/video-rooms-page.component';
import { VideoRoomPageComponent } from './video-rooms-page/video-room-page/video-room-page.component';
import {VideoRoomsBinComponent} from './video-rooms-page/video-rooms-bin/video-rooms-bin.component'

const routes: Routes = [
  {
    path: '', component: LoginLayoutComponent, children: [
      {path: '', redirectTo: '/login', pathMatch: 'full'},
      {path: 'login', component: LoginPageComponent},
      {path: 'registration', component: RegistrPageComponent},
      {path: 'photolikes', component: PublicPhotolikesPageComponent},
      {path: 'events', component: PublicEventsPageComponent},
      {path: 'privacy', component: PrivacyComponent}
    ]
  },
  {
    path: '', component: PeopleLayoutComponent, canActivate: [AuthGuard], children: [
      {path: 'people', redirectTo: '/people/friends', pathMatch: 'full'},
      {path: 'people/friends', component: FriendsPageComponent},
      {path: 'people/search', component: SearchPageComponent},
      {path: 'people/settings', component: SettingsPageComponent},
      {path: 'people/photolikes', component: PhotolikesPageComponent},
      {path: 'people/games', component: GamesComponent},
      {path: 'people/events', component: EventsPageComponent},
      {path: 'people/videorooms', component: VideoRoomsPageComponent},
      {path: 'people/videorooms/bin', component: VideoRoomsBinComponent}
    ]
  },
  {path: 'videoroom/:id', component: VideoRoomPageComponent},
  {
    path: '', component: ChatLayoutComponent, canActivate: [AuthGuard], children: [
      {path: 'chat', redirectTo: '/people/friends', pathMatch: 'full'},
      {path: 'chat/:id', component: ChatPageComponent}
    ]
  },
  {
    path: '', component: GroupLayoutComponent, canActivate: [AuthGuard], children: [
      {path: 'group', redirectTo: '/people/events', pathMatch: 'full'},
      {path: 'group/:id', component: GroupPageComponent}
    ]
  },
  {
    path: '', component: GameLayoutComponent, canActivate: [AuthGuard], children: [
      {path: 'game', redirectTo: '/people/games', pathMatch: 'full'},
      {path: 'game/1', component: Game1Component},
      {path: 'game/2', component: Game2Component},
      {path: 'game/3', component: Game3Component},
      //{path: 'game/4', component: Game4Component},
      //{path: 'game/5', component: Game5Component},
    ]
  },
  {path: 'rating', component: RatingComponent, canActivate: [ActiveUserGuard]},
  {
    path: 'table', redirectTo: '/people/events', pathMatch: 'full', canActivate: [AuthGuard]
  },
  {
    path: 'table/:id', component: MoneyTableComponent, canActivate: [AuthGuard]
  },
  {
    path: '', component: BotLayoutComponent, canActivate: [AuthGuard], children: [
      {path: 'emo', component: EmoBotPageComponent}
    ]
  },
  {
    path: '', component: AdminLayoutComponent, canActivate: [AuthGuard, ModeratorGuard], children: [
      {path: 'manage', redirectTo: '/manage/users', pathMatch: 'full'},
      {path: 'manage/users', component: UsersPageComponent},
      {path: 'manage/users/:id', component: UsersFormComponent},
      {path: 'manage/pictures/:do/:many/:folder/:_id', component: PicturesFormComponent},
      {path: 'manage/pictures/:_id', component: PicturesPageComponent},
      {path: 'manage/pictures', redirectTo: '/manage/pictures/5f12ff8cc06cd105437d84e3'},
      {path: 'manage/institutions', component: InstitutionsPageComponent},
      {path: 'manage/institutions/:do', component: InstitutionsFormComponent},
      {path: 'manage/institutions/delete/:id', component: InstitutionsDeleteComponent},
      {path: 'manage/emo', component: AdminBotPageComponent, canActivate: [AdminGuard]},
      {path: 'manage/emo/:id', component: AdminBotFormComponent, canActivate: [AdminGuard]},
      {path: 'manage/events', component: AdminEventsPageComponent},
      {path: 'manage/events/:id', component: AdminEventsFormComponent},
      {path: 'manage/table', component: AdminTablePageComponent, canActivate: [AdminGuard]},
      {path: 'manage/analytics', component: AnalyticsComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
